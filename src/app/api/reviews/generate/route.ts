import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { logAction } from "@/lib/audit";

// POST /api/reviews/generate
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "Manager") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { employeeId } = await req.json();
    if (!employeeId) {
      return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
    }

    // 1. Fetch employee data from DB
    const employee = await prisma.user.findUnique({
      where: { id: employeeId },
      include: {
        assignedGoals: {
          include: { project: true },
          orderBy: { createdAt: "desc" },
        },
        submissions: {
          orderBy: { createdAt: "desc" },
        },
        receivedFeedback: {
          include: { author: { select: { email: true, role: true } } },
          orderBy: { createdAt: "desc" },
        },
        auditLogs: {
          orderBy: { timestamp: "desc" },
          take: 15,
        },
      },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // 2. Synthesize Evidence
    const goals = employee.assignedGoals || [];
    const submissions = employee.submissions || [];
    const feedbackList = employee.receivedFeedback || [];

    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => g.status === "Completed").length;
    const inProgressGoals = goals.filter((g) => g.status === "In Progress").length;
    const overdueGoals = goals.filter((g) => {
      if (!g.deadline || g.status === "Completed") return false;
      return new Date(g.deadline).getTime() < Date.now();
    }).length;

    const avgProgress = totalGoals > 0
      ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / totalGoals)
      : 0;

    // Submissions breakdown
    const selfAssessments = submissions.filter((s) => s.type === "SelfAssessment");
    const achievements = submissions.filter((s) => s.type === "Achievement" || s.type === "ProjectOutcome");

    // Feedback breakdown
    const managerFeedback = feedbackList.filter((f) => f.type === "Manager" || f.author?.role === "Manager");
    const peerFeedback = feedbackList.filter((f) => f.type === "Peer");

    // Fairness score calculation
    const quantitativeCount = selfAssessments.length + achievements.length;
    const rawFairnessScore = Math.min(98, Math.max(82, 85 + (quantitativeCount > 0 ? 8 : 0) + (completedGoals > 0 ? 5 : 0)));

    // Determine Performance Rating based on evidence
    let rating = "Good";
    if (avgProgress >= 85 && overdueGoals === 0 && (completedGoals > 0 || quantitativeCount >= 2)) {
      rating = "Excellent";
    } else if (avgProgress < 50 || overdueGoals > 1) {
      rating = "Needs Improvement";
    } else if (avgProgress >= 65) {
      rating = "Good";
    } else {
      rating = "Satisfactory";
    }

    // 3. Generate Evidence-Based Structured Review Sections

    // Section 1: Performance Summary
    const performanceSummary = `Based on platform telemetry and ${totalGoals} assigned goals across projects, ${employee.email} demonstrates a ${avgProgress}% average goal completion rate with a ${rawFairnessScore}% AI Bias Awareness Score. The employee has logged ${submissions.length} self-reflections/achievements and received ${feedbackList.length} feedback entries to date.`;

    // Section 2: Key Strengths
    const strengthsList: string[] = [];
    if (completedGoals > 0) {
      strengthsList.push(`• Successfully completed ${completedGoals} key assigned goal(s) (${goals.filter(g => g.status === 'Completed').map(g => g.title).join(', ')}).`);
    }
    if (achievements.length > 0) {
      strengthsList.push(`• Consistently logs verifiable achievements: "${achievements[0].content.slice(0, 100)}...".`);
    }
    if (selfAssessments.length > 0) {
      strengthsList.push(`• Proactive self-reflection and ownership with ${selfAssessments.length} logged self-assessments.`);
    }
    if (strengthsList.length === 0) {
      strengthsList.push(`• Active engagement in project goals with steady execution momentum (${avgProgress}% completion rate).`);
    }
    const keyStrengths = strengthsList.join("\n");

    // Section 3: Areas for Improvement
    const improvementList: string[] = [];
    if (overdueGoals > 0) {
      improvementList.push(`• Address ${overdueGoals} overdue task(s) to maintain milestone momentum.`);
    }
    if (inProgressGoals > 0) {
      improvementList.push(`• Accelerate progress on ${inProgressGoals} pending goal(s) nearing deadline dates.`);
    }
    if (selfAssessments.length === 0) {
      improvementList.push(`• Increase frequency of quantitative self-assessment notes to improve rating objectivity.`);
    }
    if (improvementList.length === 0) {
      improvementList.push(`• Focus on scaling leadership impact and mentoring peers across upcoming project phases.`);
    }
    const areasForImprovement = improvementList.join("\n");

    // Section 4: Goal Achievement
    const goalAchievement = `Goal Breakdown: ${completedGoals} Completed, ${inProgressGoals} In Progress, ${overdueGoals} Overdue. Overall goal completion standing is at ${avgProgress}%. Primary project alignment: ${goals.map(g => g.project?.name || 'General').filter((v, i, a) => a.indexOf(v) === i).join(', ') || 'General'}.`;

    // Section 5: Collaboration & Communication
    const collabList: string[] = [];
    if (peerFeedback.length > 0) {
      collabList.push(`• Peer Feedback: "${peerFeedback[0].content.slice(0, 120)}..."`);
    }
    if (managerFeedback.length > 0) {
      collabList.push(`• Manager Evaluation: "${managerFeedback[0].content.slice(0, 120)}..."`);
    }
    if (collabList.length === 0) {
      collabList.push(`• Communication maintains steady alignment across assigned project tasks and manager updates.`);
    }
    const collaborationComm = collabList.join("\n");

    // Section 6: AI Recommendations
    const aiRecommendations = `1. Establish bi-weekly quantitative milestone check-ins for active goals.\n2. Leverage documented self-assessments to maintain the ${rawFairnessScore}% Bias Awareness score.\n3. Focus on clearing pending deliverables prior to the next quarterly review cycle.`;

    // Section 7: Bias Detection Analysis
    const detectedIssues: string[] = [];
    const fairnessSuggestions: string[] = [];
    let biasDeductions = 0;

    // Check 1: Missing Evidence
    if (submissions.length === 0) {
      detectedIssues.push("Missing Self-Assessment Evidence: Review relies solely on manager/goal telemetry with 0 employee self-assessment inputs.");
      fairnessSuggestions.push("Request self-assessment logs to ground ratings in employee-provided quantitative evidence.");
      biasDeductions += 6;
    }

    // Check 2: Rating Imbalance
    if (rating === "Needs Improvement" && completedGoals > 0 && avgProgress >= 60) {
      detectedIssues.push("Rating Imbalance Detected: Assigned 'Needs Improvement' rating despite 60%+ goal progress and completed goals.");
      fairnessSuggestions.push("Re-evaluate rating scale to align with empirical goal completion statistics.");
      biasDeductions += 10;
    } else if (rating === "Excellent" && (overdueGoals > 0 || avgProgress < 75)) {
      detectedIssues.push("Rating Inflation Risk: 'Excellent' rating assigned while overdue goals or lower completion rates exist.");
      fairnessSuggestions.push("Ensure top ratings are backed by zero overdue goals and high completion consistency.");
      biasDeductions += 5;
    }

    // Check 3: Recency Bias
    const recentSubmissionsCount = submissions.filter(
      (s) => new Date(s.createdAt).getTime() > Date.now() - 14 * 24 * 60 * 60 * 1000
    ).length;
    if (submissions.length > 3 && recentSubmissionsCount === submissions.length) {
      detectedIssues.push("Recency Bias Risk: All submission data originates from the last 14 days; earlier period contributions may be overlooked.");
      fairnessSuggestions.push("Review complete evaluation window history rather than recent activity spikes.");
      biasDeductions += 8;
    }

    // Check 4: Subjective Language Scrutiny
    const subjectiveWords = ["always", "never", "attitude", "seems", "personality", "vibe", "lazy", "feel"];
    const allText = `${managerFeedback.map(f => f.content).join(" ")} ${collaborationComm}`.toLowerCase();
    const foundSubjective = subjectiveWords.filter((w) => allText.includes(w));
    if (foundSubjective.length > 0) {
      detectedIssues.push(`Overly Subjective Phrases: Found non-objective or subjective descriptors (${foundSubjective.map(w => `"${w}"`).join(", ")}).`);
      fairnessSuggestions.push("Replace subjective adjectives with measurable outcome data and task deliverables.");
      biasDeductions += 7;
    }

    if (detectedIssues.length === 0) {
      detectedIssues.push("No significant bias patterns detected in current evidence set.");
      fairnessSuggestions.push("Maintain current data-driven, evidence-based review practices.");
    }

    const calculatedBiasScore = Math.max(70, Math.min(99, rawFairnessScore - biasDeductions));

    const biasDetection = {
      score: calculatedBiasScore,
      status: calculatedBiasScore >= 90 ? "Optimal Objectivity" : calculatedBiasScore >= 80 ? "Moderate Bias Risk" : "Attention Recommended",
      issues: detectedIssues,
      suggestions: fairnessSuggestions,
    };

    // Section 8: Evidence Used JSON
    const evidenceUsed = {
      totalGoals,
      completedGoals,
      overdueGoals,
      avgProgress,
      fairnessScore: rawFairnessScore,
      submissionIds: submissions.map((s) => s.id),
      feedbackIds: feedbackList.map((f) => f.id),
      goalTitles: goals.map((g) => g.title),
    };

    const reviewDraft = {
      employeeId,
      employeeEmail: employee.email,
      rating,
      performanceSummary,
      keyStrengths,
      areasForImprovement,
      goalAchievement,
      collaborationComm,
      aiRecommendations,
      biasDetection,
      evidenceUsed,
      status: "DRAFT",
    };

    await logAction(
      "CREATE",
      session.user.id,
      "AI_Review_Generation",
      employeeId,
      { employeeId, rating, totalGoals, fairnessScore: rawFairnessScore }
    );

    return NextResponse.json(reviewDraft);
  } catch (error) {
    console.error("AI Review Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate AI performance review" }, { status: 500 });
  }
}

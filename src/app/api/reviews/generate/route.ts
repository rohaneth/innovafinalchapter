import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { logAction } from "@/lib/audit";
import { runReviewGraph } from "@/lib/agents/graph";
import { RawFeedbackInput } from "@/types/agents";

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

// POST /api/reviews/generate
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "Manager") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate Limiting Logic
  const userId = session.user.id;
  const now = Date.now();
  let rateData = rateLimitMap.get(userId);

  if (!rateData || now - rateData.lastReset > RATE_LIMIT_WINDOW_MS) {
    rateData = { count: 1, lastReset: now };
  } else {
    rateData.count += 1;
  }
  rateLimitMap.set(userId, rateData);

  if (rateData.count > MAX_REQUESTS_PER_WINDOW) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
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
      },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // 2. Format raw data into RawFeedbackInput for the multi-agent graph
    const rawInputs: RawFeedbackInput[] = [];
    
    for (const g of (employee.assignedGoals || [])) {
      rawInputs.push({
        id: g.id,
        employeeId: employee.id,
        authorId: "system",
        authorRole: "system",
        type: "project_goal",
        content: `Goal: ${g.title}\nDescription: ${g.description}\nStatus: ${g.status}\nProgress: ${g.progress}%`,
        timestamp: g.createdAt.toISOString(),
        projectContext: g.project?.name
      });
    }

    for (const s of (employee.submissions || [])) {
      rawInputs.push({
        id: s.id,
        employeeId: employee.id,
        authorId: employee.id,
        authorRole: "employee",
        type: "self",
        content: s.content,
        timestamp: s.createdAt.toISOString(),
      });
    }

    for (const f of (employee.receivedFeedback || [])) {
      rawInputs.push({
        id: f.id,
        employeeId: employee.id,
        authorId: f.authorId,
        authorRole: (f.author?.role?.toLowerCase() === "manager" ? "manager" : "peer") as any,
        type: (f.type.toLowerCase() === "manager" ? "manager" : "peer") as any,
        content: f.content,
        timestamp: f.createdAt.toISOString(),
      });
    }

    // 3. Run the multi-agent graph with retry logic
    let finalState;
    let retries = 0;
    while (retries < 2) {
      try {
        finalState = await runReviewGraph(employeeId, "2026-H1", rawInputs);
        if (finalState.status === "completed" && finalState.draftReview) {
          break;
        }
      } catch (e) {
        console.warn(`Graph run failed on attempt ${retries + 1}`, e);
      }
      retries++;
    }

    if (!finalState || finalState.status !== "completed" || !finalState.draftReview) {
      return NextResponse.json({ error: "Failed to generate AI performance review through multi-agent pipeline" }, { status: 500 });
    }

    const { draftReview, evidenceChunks, auditFlags, metrics } = finalState;

    // 4. Determine rating
    let rating = "Good";
    if (draftReview.overallSummary.toLowerCase().includes("exceed") || draftReview.overallSummary.toLowerCase().includes("excellent")) rating = "Excellent";
    else if (draftReview.overallSummary.toLowerCase().includes("needs improvement") || draftReview.overallSummary.toLowerCase().includes("attention")) rating = "Needs Improvement";
    else if (draftReview.overallSummary.toLowerCase().includes("satisfactory")) rating = "Satisfactory";

    // 5. Build ReviewDraft payload
    const reviewDraft = {
      employeeId,
      employeeEmail: employee.email,
      rating,
      performanceSummary: draftReview.overallSummary,
      keyStrengths: JSON.stringify(draftReview.strengths, null, 2),
      areasForImprovement: JSON.stringify(draftReview.growthAreas, null, 2),
      goalAchievement: JSON.stringify(draftReview.goalProgress, null, 2),
      collaborationComm: JSON.stringify(draftReview.impactHighlights, null, 2),
      aiRecommendations: JSON.stringify(auditFlags, null, 2),
      
      auditFlags,
      evidenceChunks,
      metrics,
      draftReview,
      evidenceUsed: evidenceChunks.map(c => c.id),
      status: "DRAFT",
    };

    // 6. Log Audit Event
    await logAction(
      "CREATE",
      session.user.id,
      "AI_Review_Generation",
      employeeId,
      { employeeId, rating, metrics }
    );

    return NextResponse.json(reviewDraft);
  } catch (error) {
    console.error("AI Review Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate AI performance review" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { logAction } from "@/lib/audit";

// GET /api/reviews?employeeId=...
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get("employeeId");

  try {
    const whereCondition = employeeId
      ? { employeeId }
      : session.user.role === "Employee"
      ? { employeeId: session.user.id }
      : { managerId: session.user.id };

    const reviews = await prisma.performanceReview.findMany({
      where: whereCondition,
      include: {
        employee: { select: { email: true } },
        manager: { select: { email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST /api/reviews (Save approved or draft review)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "Manager") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      employeeId,
      status,
      rating,
      performanceSummary,
      keyStrengths,
      areasForImprovement,
      goalAchievement,
      collaborationComm,
      aiRecommendations,
      evidenceUsed,
      reviewId,
    } = body;

    if (!employeeId || !performanceSummary || !rating) {
      return NextResponse.json({ error: "Missing required review fields" }, { status: 400 });
    }

    let review;

    if (reviewId) {
      // Update existing draft / review version
      const existing = await prisma.performanceReview.findUnique({ where: { id: reviewId } });
      review = await prisma.performanceReview.update({
        where: { id: reviewId },
        data: {
          status: status || "DRAFT",
          rating,
          performanceSummary,
          keyStrengths,
          areasForImprovement,
          goalAchievement,
          collaborationComm,
          aiRecommendations,
          evidenceUsed: typeof evidenceUsed === "string" ? evidenceUsed : JSON.stringify(evidenceUsed),
          version: (existing?.version || 1) + 1,
        },
      });
    } else {
      // Create new review
      review = await prisma.performanceReview.create({
        data: {
          employeeId,
          managerId: session.user.id,
          status: status || "DRAFT",
          rating,
          performanceSummary,
          keyStrengths,
          areasForImprovement,
          goalAchievement,
          collaborationComm,
          aiRecommendations,
          evidenceUsed: typeof evidenceUsed === "string" ? evidenceUsed : JSON.stringify(evidenceUsed),
          version: 1,
        },
      });
    }

    await logAction(
      reviewId ? "UPDATE" : "CREATE",
      session.user.id,
      "PerformanceReview",
      review.id,
      { employeeId, status: review.status, rating: review.rating, version: review.version }
    );

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Save Review Error:", error);
    return NextResponse.json({ error: "Failed to save performance review" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { logAction } from "@/lib/audit";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  try {
    let goals;
    if (session.user.role === "Manager") {
      goals = await prisma.goal.findMany({
        where: {
          OR: [
            { managerId: session.user.id },
            { assigneeId: userId || session.user.id }
          ]
        },
        include: {
          assignee: { select: { id: true, email: true } },
          project: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      goals = await prisma.goal.findMany({
        where: { assigneeId: session.user.id },
        include: {
          project: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }
    return NextResponse.json(goals, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching goals" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "Manager") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      title,
      description,
      assigneeEmails, // Array of string emails or single comma-separated string
      projectId,
      priority = "Medium",
      deadline,
      status = "Not Started",
      successCriteria,
    } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Goal title is required" }, { status: 400 });
    }

    // Normalize email array
    let emails: string[] = [];
    if (Array.isArray(assigneeEmails)) {
      emails = assigneeEmails.map((e: string) => e.trim().toLowerCase()).filter(Boolean);
    } else if (typeof assigneeEmails === "string" && assigneeEmails.trim()) {
      emails = assigneeEmails.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
    }

    if (emails.length === 0) {
      return NextResponse.json({ error: "At least one assignee email is required" }, { status: 400 });
    }

    // Resolve assignees from database
    const assignees = await prisma.user.findMany({
      where: {
        email: { in: emails },
        companyId: session.user.companyId,
      },
    });

    if (assignees.length === 0) {
      return NextResponse.json({ error: "No valid assignees found in your company" }, { status: 404 });
    }

    // Create goal for each selected employee
    const createdGoals = await Promise.all(
      assignees.map(async (assignee) => {
        const goal = await prisma.goal.create({
          data: {
            title: title.trim(),
            description: description?.trim() || null,
            status,
            priority,
            deadline: deadline || null,
            successCriteria: successCriteria?.trim() || null,
            projectId: projectId || null,
            assigneeId: assignee.id,
            managerId: session.user.id,
          },
          include: {
            assignee: { select: { id: true, email: true } },
            project: { select: { id: true, name: true } },
          },
        });

        await logAction("CREATE", session.user.id, "Goal", goal.id, {
          title: goal.title,
          assigneeEmail: assignee.email,
          projectId,
        });

        return goal;
      })
    );

    return NextResponse.json(createdGoals, { status: 201 });
  } catch (error: any) {
    console.error("Goal creation error:", error);
    return NextResponse.json({ error: error?.message || "Error creating goal" }, { status: 500 });
  }
}

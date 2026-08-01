import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { logAction } from "@/lib/audit";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  try {
    let goals;
    if (session.user.role === "Manager") {
      // Manager can fetch their own goals or goals of their assigned employees
      goals = await prisma.goal.findMany({
        where: {
          OR: [
            { managerId: session.user.id },
            { assigneeId: userId || session.user.id }
          ]
        },
        include: { assignee: { select: { email: true } } }
      });
    } else {
      // Employees can only fetch their own goals
      goals = await prisma.goal.findMany({
        where: { assigneeId: session.user.id }
      });
    }
    return new Response(JSON.stringify(goals), { status: 200 });
  } catch (error) {
    return new Response("Error fetching goals", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "Manager") {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { title, description, assigneeEmail } = await req.json();

    // Find assignee by email
    const assignee = await prisma.user.findUnique({
      where: { email: assigneeEmail }
    });

    if (!assignee) {
      return new Response("Assignee not found", { status: 404 });
    }

    if (assignee.companyId !== session.user.companyId) {
       return new Response("Assignee is not in your company", { status: 403 });
    }

    const goal = await prisma.goal.create({
      data: {
        title,
        description,
        status: "Not Started",
        assigneeId: assignee.id,
        managerId: session.user.id
      }
    });

    await logAction("CREATE", session.user.id, "Goal", goal.id, { title });

    return new Response(JSON.stringify(goal), { status: 201 });
  } catch (error) {
    return new Response("Error creating goal", { status: 500 });
  }
}

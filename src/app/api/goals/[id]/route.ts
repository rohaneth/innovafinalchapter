import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { logAction } from "@/lib/audit";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { progress, status } = await req.json();
    const { id: goalId } = await context.params;

    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) return new Response("Not found", { status: 404 });

    // Only assignee or manager can update
    if (goal.assigneeId !== session.user.id && goal.managerId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: { progress, status }
    });

    await logAction("UPDATE", session.user.id, "Goal", goal.id, { progress, status });

    return new Response(JSON.stringify(updatedGoal), { status: 200 });
  } catch (error) {
    return new Response("Error updating goal", { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "Manager") {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { id: goalId } = await context.params;
    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) return new Response("Not found", { status: 404 });

    if (goal.managerId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    await prisma.goal.delete({ where: { id: goalId } });
    await logAction("DELETE", session.user.id, "Goal", goal.id);

    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response("Error deleting goal", { status: 500 });
  }
}

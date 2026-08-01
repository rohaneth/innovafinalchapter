import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { ManagerDashboardView } from "@/components/dashboard/ManagerDashboardView";

export default async function ManagerGoalsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "Manager") {
    redirect("/login");
  }

  const employees = await prisma.user.findMany({
    where: { companyId: session.user.companyId, role: "Employee" },
    include: {
      assignedGoals: { include: { project: true }, orderBy: { createdAt: "desc" } },
    },
  });

  const goals = await prisma.goal.findMany({
    where: { managerId: session.user.id },
    include: { project: true, assignee: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ManagerDashboardView
      userEmail={session.user.email}
      employees={employees}
      goals={goals}
      activeSection="goals"
    />
  );
}

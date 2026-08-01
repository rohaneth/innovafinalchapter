import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { ManagerDashboardView } from "@/components/dashboard/ManagerDashboardView";

export default async function ManagerFairnessPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "Manager") {
    redirect("/login");
  }

  const employees = await prisma.user.findMany({
    where: { companyId: session.user.companyId, role: "Employee" },
    include: {
      assignedGoals: { include: { project: true } },
      submissions: true,
      receivedFeedback: true,
    },
  });

  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { timestamp: "desc" },
    take: 20,
  });

  return (
    <ManagerDashboardView
      userEmail={session.user.email}
      employees={employees}
      auditLogs={auditLogs}
      activeSection="fairness"
    />
  );
}

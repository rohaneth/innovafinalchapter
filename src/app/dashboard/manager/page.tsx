import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { ManagerDashboardView } from "@/components/dashboard/ManagerDashboardView";

export default async function ManagerDashboard() {
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    redirect("/login");
  }

  if (!session || !session.user || session.user.role !== "Manager") {
    redirect("/login");
  }

  // Fetch employees in the manager's company
  const employees = await prisma.user.findMany({
    where: {
      companyId: session.user.companyId,
      role: "Employee",
    },
    include: {
      assignedGoals: {
        include: {
          project: true,
        },
      },
      submissions: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      receivedFeedback: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { timestamp: "desc" },
    take: 10,
  });

  return (
    <ManagerDashboardView
      userEmail={session.user.email}
      employees={employees}
      auditLogs={auditLogs}
      activeSection="overview"
    />
  );
}

import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { ManagerDashboardView } from "@/components/dashboard/ManagerDashboardView";

export default async function ManagerAnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "Manager") {
    redirect("/login");
  }

  const employees = await prisma.user.findMany({
    where: { companyId: session.user.companyId, role: "Employee" },
    include: {
      assignedGoals: { include: { project: true } },
      submissions: { orderBy: { createdAt: "desc" } },
    },
  });

  return (
    <ManagerDashboardView
      userEmail={session.user.email}
      employees={employees}
      activeSection="analytics"
    />
  );
}

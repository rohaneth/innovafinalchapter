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
      assignedGoals: true,
    },
  });

  return <ManagerDashboardView employees={employees} />;
}

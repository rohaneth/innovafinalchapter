import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { ManagerDashboardView } from "@/components/dashboard/ManagerDashboardView";

export default async function ManagerProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "Manager") {
    redirect("/login");
  }

  const managerUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { company: true },
  });

  const employees = await prisma.user.findMany({
    where: { companyId: session.user.companyId, role: "Employee" },
    include: { assignedGoals: true },
  });

  if (!managerUser) return <div>User not found</div>;

  return (
    <ManagerDashboardView
      userEmail={managerUser.email}
      companyName={managerUser.company?.name || "Innova Tech Inc."}
      employees={employees}
      activeSection="profile"
    />
  );
}

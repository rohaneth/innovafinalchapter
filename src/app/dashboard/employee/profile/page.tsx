import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { EmployeeDashboardView } from "@/components/dashboard/EmployeeDashboardView";

export default async function EmployeeProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "Employee") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      company: true,
      assignedGoals: { include: { project: true } },
      submissions: { orderBy: { createdAt: "desc" }, take: 10 },
      receivedFeedback: { include: { author: { select: { email: true, role: true } } } },
    },
  });

  if (!user) return <div>User not found</div>;

  return (
    <EmployeeDashboardView
      userEmail={user.email}
      companyName={user.company?.name || "Innova Tech Inc."}
      goals={user.assignedGoals}
      submissions={user.submissions}
      managerFeedback={user.receivedFeedback}
      activeSection="profile"
    />
  );
}

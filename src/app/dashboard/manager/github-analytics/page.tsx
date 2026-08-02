import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GitHubAnalyticsView } from "@/components/dashboard/GitHubAnalyticsView";

export default async function GitHubAnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "Manager") {
    redirect("/login");
  }

  return <GitHubAnalyticsView />;
}

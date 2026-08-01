import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardRouter() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      redirect("/login");
    }

    if (session.user.role === "Manager") {
      redirect("/dashboard/manager");
    } else {
      redirect("/dashboard/employee");
    }
  } catch (error) {
    // If JWT decryption fails or session cookie is invalid/stale, redirect to login cleanly
    redirect("/login");
  }
}

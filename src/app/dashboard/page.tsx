import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardRouter() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  if (session.user.role === "Manager") {
    redirect("/dashboard/manager");
  } else {
    redirect("/dashboard/employee");
  }
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function DashboardRouter() {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    // If decryption fails due to a stale browser cookie, clear the session cookie
    const cookieStore = await cookies();
    cookieStore.delete("next-auth.session-token");
    cookieStore.delete("__Secure-next-auth.session-token");
    redirect("/login");
  }

  if (!session || !session.user) {
    redirect("/login");
  }

  if (session.user.role === "Manager") {
    redirect("/dashboard/manager");
  } else {
    redirect("/dashboard/employee");
  }
}

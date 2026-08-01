import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "Manager") {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Fetch audit logs for all users in the manager's company
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        user: {
          companyId: session.user.companyId,
        },
      },
      include: {
        user: {
          select: { email: true, role: true },
        },
      },
      orderBy: { timestamp: "desc" },
      take: 50,
    });

    return new Response(JSON.stringify(auditLogs), { status: 200 });
  } catch (error) {
    return new Response("Error fetching audit logs", { status: 500 });
  }
}

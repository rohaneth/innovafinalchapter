import { NextResponse } from "next/server";
import { prisma } from "../../../lib/vector/client";

export async function GET() {
  try {
    const employees = await prisma.user.findMany({
      where: { role: "Employee" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" }
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

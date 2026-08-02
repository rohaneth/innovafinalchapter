import { NextResponse } from "next/server";
import { OrganizationKnowledgeService } from "@/lib/knowledge/service";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    const knowledge = await OrganizationKnowledgeService.getEmployeeKnowledge(id);
    return NextResponse.json({ knowledge });
  } catch (error: any) {
    console.error(`Error in /api/knowledge/employee:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


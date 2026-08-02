import { NextResponse } from "next/server";
import { OrganizationKnowledgeService } from "@/lib/knowledge/service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ error: "companyId is required" }, { status: 400 });
    }

    const knowledge = await OrganizationKnowledgeService.getCompanyKnowledge(companyId);
    return NextResponse.json({ knowledge });
  } catch (error: any) {
    console.error("Error in /api/knowledge/company:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

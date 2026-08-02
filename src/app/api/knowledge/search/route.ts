import { NextResponse } from "next/server";
import { OrganizationKnowledgeService } from "@/lib/knowledge/service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ error: "Search query 'q' is required" }, { status: 400 });
    }

    const knowledge = await OrganizationKnowledgeService.searchKnowledge(query);
    return NextResponse.json({ knowledge });
  } catch (error: any) {
    console.error("Error in /api/knowledge/search:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "../../../lib/vector/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return NextResponse.json({ error: "Missing employeeId" }, { status: 400 });
    }

    // Prisma doesn't strictly type JSON fields for where clauses out of the box in this version,
    // so we fetch all and filter, or we can use a raw query if needed. 
    // Given the small dummy dataset, fetching all and filtering is fine for demonstration.
    const allEvidence = await prisma.evidenceChunk.findMany();
    
    const employeeEvidence = allEvidence.filter(e => {
      const meta = e.metadata as any;
      return meta && meta.employeeId === employeeId;
    }).map(e => {
      const meta = e.metadata as any;
      return {
        id: e.id,
        employeeId: meta.employeeId,
        sourceId: e.id,
        type: meta.sourceType,
        content: e.content,
        timestamp: meta.timestamp || new Date().toISOString(),
        authorRole: meta.authorRole || 'Unknown',
      };
    });

    return NextResponse.json(employeeEvidence);
  } catch (error) {
    console.error("Failed to fetch evidence:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

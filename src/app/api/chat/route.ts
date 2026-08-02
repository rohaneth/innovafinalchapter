import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { invokeGroq } from "@/lib/llm/groq";
import { OrganizationKnowledgeService } from "@/lib/knowledge/service";

export async function POST(req: Request) {
  console.log("\n=============================");
  console.log("🚀 /api/chat request received");
  console.log("=============================\n");

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const companyId = (session.user as any).companyId;

    // Parse request body
    let body;

    try {
      body = await req.json();
    } catch (err) {
      console.error("❌ Failed to parse JSON body:", err);

      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const {
      message,
      history = [],
    }: {
      message?: string;
      history?: { role: string; content: string }[];
    } = body;

    console.log("📩 Message:", message);

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    console.log("🔑 GROQ KEY FOUND:", !!process.env.GROQ_API_KEY);

    // ------------------------
    // Search knowledge
    // ------------------------

    console.log("🔍 Searching knowledge...");

    let knowledge = [];

    try {
      knowledge =
        (await OrganizationKnowledgeService.searchKnowledge(message, companyId)) ?? [];

      console.log(`✅ Found ${knowledge.length} knowledge entries`);
    } catch (err) {
      console.error("❌ Knowledge search failed");
      console.error(err);

      return NextResponse.json(
        {
          error: "Knowledge search failed",
          details: err instanceof Error ? err.message : String(err),
        },
        { status: 500 }
      );
    }

    // ------------------------
    // Build knowledge context
    // ------------------------

    const knowledgeContext =
      knowledge.length > 0
        ? knowledge
          .map(
            (k: any) => `
[Source: ${k.type?.toUpperCase() ?? "UNKNOWN"} ID: ${k.id}]
Title: ${k.title ?? "Untitled"}

${k.content ?? ""}
`
          )
          .join("\n--------------------------------\n")
        : "No relevant organizational knowledge found.";

    // ------------------------
    // System Prompt
    // ------------------------

    const systemPrompt = `
You are the Organization AI Assistant.

Use the provided organizational knowledge to answer the user's questions.

Rules:
1. Be extremely helpful and conversational. Infer answers aggressively. 
   - If asked about "tasks" or "commits", look at "goals", "progress", and "submissions". 
   - If asked who deserves a promotion, look at who has high progress, good reviews, or completed goals.
   - If asked to summarize, just summarize the data provided.
2. Every factual statement MUST include a citation if possible (e.g. [Source: GOAL ID: 123]).
3. ONLY if the provided knowledge contains absolutely no related information, reply:
   "I have insufficient evidence to answer this question."

Knowledge:

${knowledgeContext}
`;

    // ------------------------
    // Build user prompt
    // ------------------------

    let userPrompt = "";

    if (Array.isArray(history) && history.length > 0) {
      userPrompt += "Conversation History:\n\n";

      for (const item of history) {
        userPrompt += `${item.role}: ${item.content}\n`;
      }

      userPrompt += "\n";
    }

    userPrompt += `Current Question:\n${message}`;

    console.log("📤 Calling Groq...");

    // ------------------------
    // Call LLM
    // ------------------------

    let answer = "";

    try {
      answer = await invokeGroq(
        systemPrompt,
        userPrompt,
        false
      );

      console.log("✅ Groq response received");
    } catch (err) {
      console.error("❌ Groq invocation failed");
      console.error(err);

      return NextResponse.json(
        {
          error: "Groq API failed",
          details: err instanceof Error ? err.message : String(err),
        },
        { status: 500 }
      );
    }

    // ------------------------
    // Success
    // ------------------------

    return NextResponse.json({
      success: true,
      answer,
      sources: knowledge.map((k: any) => ({
        id: k.id,
        type: k.type,
        title: k.title,
      })),
    });
  } catch (err) {
    console.error("\n=======================");
    console.error("💥 UNEXPECTED ERROR");
    console.error("=======================");
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        stack:
          process.env.NODE_ENV === "development"
            ? err instanceof Error
              ? err.stack
              : undefined
            : undefined,
      },
      { status: 500 }
    );
  }
}
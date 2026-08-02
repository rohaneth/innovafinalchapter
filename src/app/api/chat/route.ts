import { NextResponse } from "next/server";
import { invokeGroq } from "@/lib/llm/groq";
import { OrganizationKnowledgeService } from "@/lib/knowledge/service";

export async function POST(req: Request) {
  try {
    const { message, history = [] } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Retrieve relevant organizational knowledge
    const knowledge = await OrganizationKnowledgeService.searchKnowledge(message);
    const knowledgeContext = knowledge.map(k => `[Source: ${k.type.toUpperCase()} ID: ${k.id}]\n${k.title}\n${k.content}`).join("\n\n");

    const systemPrompt = `You are the Organization AI Assistant. You have access to the Organization Knowledge Hub.
You must answer questions based ONLY on the provided context below. 
Every claim or answer you provide MUST include evidence citations (e.g., "[Source: GOAL ID: 123]").
If the context does not contain the answer, say "I have insufficient evidence to answer this question."

Context from Knowledge Hub:
${knowledgeContext}
`;

    // Construct prompt with history
    let userPrompt = "";
    if (history.length > 0) {
      userPrompt += "Previous conversation:\n";
      history.forEach((h: any) => {
        userPrompt += `${h.role}: ${h.content}\n`;
      });
      userPrompt += "\n";
    }
    userPrompt += `Current Question: ${message}`;

    const answer = await invokeGroq(systemPrompt, userPrompt, false);

    return NextResponse.json({ answer, sources: knowledge.map(k => ({ id: k.id, type: k.type, title: k.title })) });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

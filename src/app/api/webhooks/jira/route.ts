import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { jiraWebhookSchema } from "@/lib/validators/jira";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const url = new URL(request.url);
    const secret = url.searchParams.get("secret");

    if (process.env.JIRA_WEBHOOK_SECRET && secret !== process.env.JIRA_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Invalid webhook secret in URL" }, { status: 401 });
    }

    const json = JSON.parse(rawBody);

    const issue = json.issue;
    if (!issue || !issue.fields || !issue.fields.summary) {
       return NextResponse.json({ error: "Invalid Jira payload format" }, { status: 400 });
    }

    const rawText = `Jira Ticket ${issue.key}: ${issue.fields.summary}\n${issue.fields.description || ""}`;

    let matchedUser = null;
    const assigneeEmail = issue.fields.assignee?.emailAddress;
    if (assigneeEmail) {
      matchedUser = await prisma.user.findUnique({
        where: { email: assigneeEmail }
      });
    }

    if (!matchedUser) {
       matchedUser = await prisma.user.findFirst({ where: { role: "Employee" } });
    }

    if (!matchedUser) {
       return NextResponse.json({ error: "No employee found" }, { status: 400 });
    }

    await prisma.submission.create({
      data: {
        type: "JiraTicket",
        content: rawText,
        userId: matchedUser.id,
      }
    });

    return NextResponse.json({ success: true, message: "Jira ticket ingested as evidence" });
  } catch (error) {
    console.error("Error processing Jira webhook:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

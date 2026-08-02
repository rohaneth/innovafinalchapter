import prisma from "../db";

export interface KnowledgeItem {
  id: string;
  type: "user" | "company" | "project" | "goal" | "feedback" | "submission" | "review" | "audit";
  title: string;
  content: string;
  metadata: Record<string, any>;
  timestamp: string;
}

export class OrganizationKnowledgeService {
  /**
   * Fetches company-wide knowledge: projects, users, top-level info.
   */
  static async getCompanyKnowledge(companyId: string): Promise<KnowledgeItem[]> {
    const knowledge: KnowledgeItem[] = [];

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        projects: true,
        users: { select: { id: true, email: true, role: true } },
      }
    });

    if (!company) return [];

    knowledge.push({
      id: company.id,
      type: "company",
      title: company.name,
      content: `Company ${company.name} with ${company.users.length} users and ${company.projects.length} projects.`,
      metadata: { userCount: company.users.length, projectCount: company.projects.length },
      timestamp: new Date().toISOString()
    });

    for (const project of company.projects) {
      knowledge.push({
        id: project.id,
        type: "project",
        title: project.name,
        content: project.description || "No description",
        metadata: { companyId: project.companyId },
        timestamp: project.createdAt.toISOString()
      });
    }

    return knowledge;
  }

  /**
   * Fetches an employee's comprehensive knowledge profile.
   */
  static async getEmployeeKnowledge(employeeId: string): Promise<KnowledgeItem[]> {
    const knowledge: KnowledgeItem[] = [];

    const user = await prisma.user.findUnique({
      where: { id: employeeId },
      include: {
        assignedGoals: true,
        submissions: true,
        receivedFeedback: true,
        receivedReviews: true
      }
    });

    if (!user) return [];

    knowledge.push({
      id: user.id,
      type: "user",
      title: user.email,
      content: `Employee Role: ${user.role}`,
      metadata: { email: user.email, role: user.role },
      timestamp: new Date().toISOString()
    });

    for (const goal of user.assignedGoals) {
      knowledge.push({
        id: goal.id,
        type: "goal",
        title: goal.title,
        content: goal.description || "",
        metadata: { status: goal.status, progress: goal.progress, deadline: goal.deadline },
        timestamp: goal.createdAt.toISOString()
      });
    }

    for (const sub of user.submissions) {
      knowledge.push({
        id: sub.id,
        type: "submission",
        title: `Submission: ${sub.type}`,
        content: sub.content,
        metadata: { type: sub.type },
        timestamp: sub.createdAt.toISOString()
      });
    }

    for (const fb of user.receivedFeedback) {
      knowledge.push({
        id: fb.id,
        type: "feedback",
        title: `Feedback from ${fb.authorId}`,
        content: fb.content,
        metadata: { type: fb.type, authorId: fb.authorId },
        timestamp: fb.createdAt.toISOString()
      });
    }

    for (const review of user.receivedReviews) {
      knowledge.push({
        id: review.id,
        type: "review",
        title: `Review Current`,
        content: `Rating: ${review.rating}. Strengths: ${review.keyStrengths}. Areas for Improvement: ${review.areasForImprovement}.`,
        metadata: { status: review.status, rating: review.rating },
        timestamp: review.createdAt.toISOString()
      });
    }

    return knowledge;
  }

  /**
   * Fetches project specific knowledge.
   */
  static async getProjectKnowledge(projectId: string): Promise<KnowledgeItem[]> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { goals: true }
    });

    if (!project) return [];
    
    const knowledge: KnowledgeItem[] = [{
      id: project.id,
      type: "project",
      title: project.name,
      content: project.description || "",
      metadata: { companyId: project.companyId },
      timestamp: project.createdAt.toISOString()
    }];

    for (const goal of project.goals) {
      knowledge.push({
        id: goal.id,
        type: "goal",
        title: goal.title,
        content: goal.description || "",
        metadata: { status: goal.status, progress: goal.progress },
        timestamp: goal.createdAt.toISOString()
      });
    }

    return knowledge;
  }

  /**
   * Universal search across normalized knowledge based on a query.
   * This is a simple implementation, but in production, we could integrate with pgvector or full-text search.
   */
  static async searchKnowledge(query: string, companyId?: string): Promise<KnowledgeItem[]> {
    const knowledge: KnowledgeItem[] = [];

    // Always include top-level company info for broad questions
    const companies = await prisma.company.findMany({
      where: companyId ? { id: companyId } : undefined,
      include: {
        projects: true,
        users: { select: { id: true, email: true, role: true } },
      }
    });

    for (const company of companies) {
      knowledge.push({
        id: company.id,
        type: "company",
        title: company.name,
        content: `Company ${company.name} with ${company.users.length} users and ${company.projects.length} projects.\nUsers: ${company.users.map(u => u.email).join(", ")}\nProjects: ${company.projects.map(p => p.name).join(", ")}`,
        metadata: { userCount: company.users.length, projectCount: company.projects.length },
        timestamp: new Date().toISOString()
      });
    }

    // Search users
    const users = await prisma.user.findMany({
      where: companyId ? { companyId } : undefined,
      take: 50
    });
    for (const u of users) {
      knowledge.push({
        id: u.id, type: "user", title: u.email, content: `Role: ${u.role}`, metadata: {}, timestamp: new Date().toISOString()
      });
    }

    // Search goals
    const goals = await prisma.goal.findMany({
      where: companyId ? { project: { companyId } } : undefined,
      include: {
        assignee: { select: { email: true, role: true } },
        project: { select: { name: true } }
      },
      take: 50
    });
    for (const g of goals) {
      const projectName = g.project ? g.project.name : "No Project";
      const assigneeEmail = g.assignee ? g.assignee.email : "Unassigned";
      
      knowledge.push({
        id: g.id, 
        type: "goal", 
        title: g.title, 
        content: `Project: ${projectName}\nAssignee: ${assigneeEmail}\nDescription: ${g.description || ""}`, 
        metadata: { status: g.status }, 
        timestamp: g.createdAt.toISOString()
      });
    }

    // Search submissions
    const submissions = await prisma.submission.findMany({
      where: companyId ? { user: { companyId } } : undefined,
      include: {
        user: { select: { email: true } }
      },
      take: 50
    });
    for (const s of submissions) {
      const authorEmail = s.user ? s.user.email : "Unknown User";
      knowledge.push({
        id: s.id, 
        type: "submission", 
        title: s.type, 
        content: `Author: ${authorEmail}\nContent: ${s.content}`, 
        metadata: { type: s.type }, 
        timestamp: s.createdAt.toISOString()
      });
    }

    return knowledge;
  }
}

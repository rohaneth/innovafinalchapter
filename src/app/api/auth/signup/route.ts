import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password, role, companyName } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 400 }
      );
    }

    // Hash password securely with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Get or create company
    const compName = companyName?.trim() || "Innova Tech Inc.";
    let company = await prisma.company.findFirst({
      where: { name: compName },
    });

    if (!company) {
      company = await prisma.company.create({
        data: { name: compName },
      });
    }

    // Format role ("Manager" | "Employee")
    const formattedRole = role.toLowerCase() === "manager" ? "Manager" : "Employee";

    // Create user in SQLite database
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role: formattedRole,
        companyId: company.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create account" },
      { status: 500 }
    );
  }
}

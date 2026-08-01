"use client";

import React from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface SidebarProps {
  role: "employee" | "manager";
  activePath?: string;
}

export function Sidebar({ role, activePath = "/dashboard" }: SidebarProps) {
  const employeeLinks = [
    { name: "Dashboard Overview", path: "/dashboard/employee" },
    { name: "My Goals", path: "/dashboard/employee" },
    { name: "Self Assessments & Notes", path: "/dashboard/employee" },
  ];

  const managerLinks = [
    { name: "Dashboard Overview", path: "/dashboard/manager" },
    { name: "Employee Directory", path: "/dashboard/manager" },
    { name: "Review Workspaces", path: "/workspace/emp-001" },
  ];

  const links = role === "manager" ? managerLinks : employeeLinks;

  return (
    <div
      style={{
        width: "260px",
        backgroundColor: "var(--bg-surface)",
        borderRight: "1px solid var(--border-default)",
        height: "100vh",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 40,
      }}
    >
      <div style={{ marginBottom: "32px", paddingLeft: "12px" }}>
        <h2 style={{ color: "var(--text-primary)", fontSize: "18px", fontWeight: "bold", margin: 0 }}>
          Bias-Aware 360°
        </h2>
        <span
          style={{
            color: "var(--accent-primary)",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "1px",
            fontWeight: "bold",
          }}
        >
          {role === "manager" ? "Manager Portal" : "Employee Portal"}
        </span>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
        {links.map((link) => {
          const isActive = activePath === link.path;
          return (
            <Link
              key={link.name}
              href={link.path}
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                textDecoration: "none",
                color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                backgroundColor: isActive ? "var(--bg-surface-hover)" : "transparent",
                border: isActive ? "1px solid var(--border-active)" : "1px solid transparent",
                transition: "all 0.2s",
                fontWeight: isActive ? "600" : "normal",
                fontSize: "14px",
              }}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "12px", borderTop: "1px solid var(--border-default)", marginTop: "auto" }}>
        <div style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "8px" }}>
          Logged in as: <b style={{ color: "var(--text-primary)" }}>{role === "manager" ? "Manager" : "Employee"}</b>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            background: "none",
            border: "none",
            color: "var(--state-error)",
            fontSize: "13px",
            cursor: "pointer",
            padding: 0,
            fontWeight: "600",
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

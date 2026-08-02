"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TopNavProps {
  title: string;
}

export function TopNav({ title }: TopNavProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Extract initial & display name from email or name
  const userEmail = session?.user?.email || "";
  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : "U";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Role-aware profile & notification paths
  const isManager = session?.user?.role === "Manager";
  const profilePath = isManager ? "/dashboard/manager/profile" : "/dashboard/employee/profile";
  const notificationsPath = isManager ? "/dashboard/manager/audit-logs" : "/dashboard/employee/activity";

  return (
    <div
      style={{
        height: "70px",
        borderBottom: "1px solid var(--border-default)",
        display: "flex",
        alignItems: "center",
        padding: "0 32px",
        backgroundColor: "var(--bg-base)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <h1 style={{ fontSize: "20px", fontWeight: "600", color: "var(--text-primary)" }}>
        {title}
      </h1>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "16px", position: "relative" }} ref={dropdownRef}>
        {/* Chatbot Navigation Button */}
        <Link
          href="/chat"
          title="Open Organization AI"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "20px",
            backgroundColor: "var(--accent-glow)",
            border: "1px solid var(--accent-primary)",
            color: "var(--accent-primary)",
            fontWeight: "600",
            fontSize: "14px",
            textDecoration: "none",
            transition: "all 0.2s ease",
            boxShadow: "0 0 12px var(--accent-glow)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--accent-primary)";
            e.currentTarget.style.color = "#ffffff";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--accent-glow)";
            e.currentTarget.style.color = "var(--accent-primary)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <path d="M12 7v0M12 11v0M12 15v0" />
          </svg>
          Ask AI Assistant
        </Link>

        {/* Clickable Profile Avatar */}
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "var(--bg-surface-hover)",
            border: "1px solid var(--accent-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "16px",
            color: "var(--accent-primary)",
            cursor: "pointer",
            outline: "none",
            transition: "all 0.2s ease",
            boxShadow: dropdownOpen ? "0 0 10px var(--accent-glow)" : "none",
          }}
        >
          {initial}
        </button>

        {/* Profile Dropdown Menu */}
        {dropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: "50px",
              right: 0,
              width: "220px",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              borderRadius: "10px",
              padding: "8px 0",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border-default)", marginBottom: "4px" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Signed in as</div>
              <div style={{ fontSize: "13px", fontWeight: "bold", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {userEmail || "User"}
              </div>
            </div>

            <Link
              href={profilePath}
              onClick={() => setDropdownOpen(false)}
              style={{
                padding: "10px 16px",
                color: "var(--text-primary)",
                textDecoration: "none",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <span>👤</span> My Profile
            </Link>

            <Link
              href={profilePath}
              onClick={() => setDropdownOpen(false)}
              style={{
                padding: "10px 16px",
                color: "var(--text-primary)",
                textDecoration: "none",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <span>⚙️</span> Settings
            </Link>

            <div
              onClick={() => {
                setDropdownOpen(false);
                router.push(notificationsPath);
              }}
              style={{
                padding: "10px 16px",
                color: "var(--text-primary)",
                cursor: "pointer",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <span>🔔</span> Notifications
            </div>

            <hr style={{ borderColor: "var(--border-default)", margin: "4px 0" }} />

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              style={{
                padding: "10px 16px",
                color: "var(--state-error)",
                background: "none",
                border: "none",
                textAlign: "left",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "100%",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <span>🚪</span> Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

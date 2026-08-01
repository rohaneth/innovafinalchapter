"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email: demoEmail,
      password: "password123",
      redirect: false,
    });

    if (res?.error) {
      setError("Failed to sign in with demo account");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        flexDirection: "column",
        background: "var(--bg-base)",
        padding: "24px",
      }}
    >
      <div style={{ marginBottom: "24px", textAlign: "center" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: "0 0 8px 0" }}>
          Bias-Aware 360° Review System
        </h1>
        <p style={{ color: "var(--text-muted)", margin: 0 }}>
          Sign in to access your role-based performance workspace
        </p>
      </div>

      <Card style={{ width: "100%", maxWidth: "420px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {error && (
          <div
            style={{
              padding: "10px",
              background: "rgba(244, 63, 94, 0.15)",
              color: "var(--state-error)",
              borderRadius: "6px",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", color: "var(--text-muted)" }}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border-default)",
                backgroundColor: "var(--bg-base)",
                color: "var(--text-primary)",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", color: "var(--text-muted)" }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border-default)",
                backgroundColor: "var(--bg-base)",
                color: "var(--text-primary)",
                fontSize: "14px",
              }}
            />
          </div>

          <Button type="submit" disabled={loading} style={{ marginTop: "4px" }}>
            {loading ? "Signing in..." : "Log In"}
          </Button>
        </form>

        <hr style={{ borderColor: "var(--border-default)", margin: "8px 0", borderTop: 0 }} />

        {/* Quick Role Switchers */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>
            Or sign in instantly as a Demo User:
          </span>
          <button
            type="button"
            onClick={() => handleQuickLogin("manager@company.com")}
            disabled={loading}
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid var(--accent-primary)",
              background: "rgba(224, 53, 162, 0.1)",
              color: "var(--accent-primary)",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            👔 Sign In as Manager (manager@company.com)
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin("employee@company.com")}
            disabled={loading}
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid var(--accent-secondary)",
              background: "rgba(139, 92, 246, 0.1)",
              color: "var(--accent-secondary)",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            👤 Sign In as Employee (employee@company.com)
          </button>
        </div>
      </Card>

      <p style={{ marginTop: "24px", color: "var(--text-muted)", fontSize: "14px" }}>
        Don't have an account?{" "}
        <Link href="/signup" style={{ color: "var(--accent-primary)" }}>
          Sign up
        </Link>
      </p>
    </div>
  );
}

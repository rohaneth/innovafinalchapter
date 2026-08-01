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

  const validate = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address (e.g. name@company.com).");
      return false;
    }
    if (!password) {
      setError("Please enter your password.");
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password: password.trim(),
        redirect: false,
      });

      if (res?.error) {
        if (res.error === "CredentialsSignin") {
          setError("Invalid email or password. Please check your credentials and try again.");
        } else {
          setError(res.error || "Unable to sign in. Please try again later.");
        }
        setLoading(false);
      } else if (res?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("An unexpected error occurred during login. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "Connection error. Please check your network and try again.");
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email: demoEmail.trim().toLowerCase(),
        password: "password123",
        redirect: false,
      });

      if (res?.error) {
        setError("Failed to sign in with demo account. Please ensure the database is seeded.");
        setLoading(false);
      } else if (res?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("An error occurred during quick sign in.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "Connection error during quick sign in.");
      setLoading(false);
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
              padding: "12px",
              background: "rgba(244, 63, 94, 0.15)",
              border: "1px solid var(--state-error)",
              color: "var(--state-error)",
              borderRadius: "6px",
              fontSize: "13px",
              lineHeight: "1.4",
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


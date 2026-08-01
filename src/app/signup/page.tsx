"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Employee");
  const [companyName, setCompanyName] = useState("Innova Tech Inc.");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, companyName }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error || "Signup failed");
      }

      // Automatically sign in upon successful database creation
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        throw new Error("Account created! Please sign in.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
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
          Create your account & store securely in database
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

        <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", color: "var(--text-muted)" }}>Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Innova Tech Inc."
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
            <label style={{ fontSize: "13px", color: "var(--text-muted)" }}>Account Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border-default)",
                backgroundColor: "var(--bg-base)",
                color: "var(--text-primary)",
                fontSize: "14px",
              }}
            >
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          <Button type="submit" disabled={loading} style={{ marginTop: "4px" }}>
            {loading ? "Creating Account..." : "Create Account & Sign In"}
          </Button>
        </form>
      </Card>

      <p style={{ marginTop: "24px", color: "var(--text-muted)", fontSize: "14px" }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "var(--accent-primary)" }}>
          Log in
        </Link>
      </p>
    </div>
  );
}

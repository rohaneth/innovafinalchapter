"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import { GitHubAnalyticsData, GitHubUserMetrics } from "@/lib/github";
import Image from "next/image";

export function GitHubAnalyticsView() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<GitHubAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData(days);
  }, [days]);

  const fetchData = async (daysFilter: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/github/analytics?days=${daysFilter}`);
      if (!res.ok) {
        throw new Error("Failed to fetch analytics");
      }
      const json = await res.json();
      if (json.error) {
        throw new Error(json.error);
      }
      setData(json);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "Overperforming":
        return <Badge status="success">🌟 {category}</Badge>;
      case "Performing Well":
        return <Badge status="processing">✅ {category}</Badge>;
      case "Needs Attention":
        return <Badge status="warning">⚠️ {category}</Badge>;
      case "Recently Inactive":
        return <Badge status="error">💤 {category}</Badge>;
      default:
        return <Badge status="draft">{category}</Badge>;
    }
  };

  const tableData = data?.leaderboard.map((user) => [
    <div key={`user-${user.username}`} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {user.avatarUrl ? (
        <img src={user.avatarUrl} alt={user.username} width={40} height={40} style={{ borderRadius: "50%" }} />
      ) : (
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--bg-surface-hover)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {user.username.charAt(0).toUpperCase()}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontWeight: "bold" }}>{user.username}</span>
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Last active: {new Date(user.lastContribution).toLocaleDateString()}</span>
      </div>
    </div>,
    <div key={`stats-${user.username}`} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <span><strong>{user.commits}</strong> Commits</span>
      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{user.filesChanged} files, +{user.linesAdded} / -{user.linesDeleted}</span>
    </div>,
    <div key={`prs-${user.username}`} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <span><strong>{user.prsOpened}</strong> Opened</span>
      <span><strong>{user.prsMerged}</strong> Merged</span>
    </div>,
    <div key={`score-${user.username}`} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ fontWeight: "bold", fontSize: "16px", color: "var(--accent-primary)" }}>{user.score} pts</div>
      {getCategoryBadge(user.category)}
    </div>,
    <div key={`explanation-${user.username}`} style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "200px" }}>
      {user.explanation}
    </div>
  ]) || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>🐙 GitHub Performance Analytics</h2>
          <p style={{ color: "var(--text-muted)", margin: "4px 0 0 0" }}>Evidence-based evaluation using commits, PRs, and code churn.</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              background: "var(--bg-base)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-default)",
              fontSize: "14px",
            }}
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
          Loading GitHub analytics...
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--state-error)" }}>
          {error}
        </div>
      ) : data ? (
        <>


          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-default)" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>Developer Leaderboard</h3>
            </div>
            {data.leaderboard.length > 0 ? (
              <Table
                headers={["Developer", "Code Churn", "Pull Requests", "Score & Status", "Analysis"]}
                data={tableData}
              />
            ) : (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                No developer data found for this time period.
              </div>
            )}
          </Card>

          <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
            <Card>
              <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "16px" }}>📈 Contribution Trend</h3>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "150px", marginTop: "20px" }}>
                {data.trends.map((t, i) => {
                  const maxVal = Math.max(...data.trends.map(x => x.commits + x.prs), 1);
                  const hPct = Math.max(((t.commits + t.prs) / maxVal) * 100, 2);
                  return (
                    <div key={t.date} title={`${t.date}: ${t.commits} commits, ${t.prs} PRs`} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center" }}>
                      <div style={{ width: "100%", background: "var(--accent-primary)", height: `${hPct}%`, borderRadius: "2px 2px 0 0", opacity: 0.8 }} />
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card>
              <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "16px" }}>🧩 Module Ownership</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {data.insights.moduleOwnership.map((mo, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "var(--bg-surface-hover)", borderRadius: "8px" }}>
                    <span style={{ fontWeight: "500", color: "var(--text-primary)" }}>{mo.module}</span>
                    <span style={{ color: "var(--text-muted)" }}>{mo.owner}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}

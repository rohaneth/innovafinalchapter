export interface GitHubUserMetrics {
  username: string;
  avatarUrl: string;
  commits: number;
  prsOpened: number;
  prsMerged: number;
  filesChanged: number;
  linesAdded: number;
  linesDeleted: number;
  lastContribution: string;
  recentCommits: string[];
}

export interface GitHubAnalyticsData {
  leaderboard: (GitHubUserMetrics & { score: number; category: string; explanation: string })[];
  trends: { date: string; commits: number; prs: number }[];
  insights: {
    topContributors: string[];
    underperformers: string[];
    inactiveDevelopers: string[];
    moduleOwnership: { module: string; owner: string }[];
  };
}

// In-memory cache for simple rate limit avoidance
const cache = new Map<string, { data: GitHubAnalyticsData; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchGitHubAnalytics(days: number): Promise<GitHubAnalyticsData> {
  const cacheKey = `github_analytics_${days}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const token = process.env.GITHUB_PAT;

  // If credentials are not set, return mock data so the UI doesn't break
  if (!token) {
    console.warn("GITHUB_PAT not set. Returning mock GitHub data.");
    return generateMockGitHubData(days);
  }

  try {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);
    const sinceIso = sinceDate.toISOString();

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    // 1. Fetch the authenticated user's repositories (top 3 recently updated to avoid rate limits)
    const reposRes = await fetch(`https://api.github.com/user/repos?sort=updated&per_page=3`, { headers });
    if (!reposRes.ok) throw new Error(`GitHub Repos API error: ${reposRes.statusText}`);
    const repos = await reposRes.json();

    let commits: any[] = [];
    let prs: any[] = [];

    for (const r of repos) {
      const repoName = r.full_name;
      
      const commitsRes = await fetch(`https://api.github.com/repos/${repoName}/commits?since=${sinceIso}&per_page=30`, { headers });
      if (commitsRes.ok) {
        commits = commits.concat(await commitsRes.json());
      }

      const prsRes = await fetch(`https://api.github.com/repos/${repoName}/pulls?state=all&sort=updated&direction=desc&per_page=30`, { headers });
      if (prsRes.ok) {
        prs = prs.concat(await prsRes.json());
      }
    }

    // Process data per user
    const userMap = new Map<string, GitHubUserMetrics>();

    for (const commit of commits) {
      if (!commit.author) continue;
      const username = commit.author.login;
      
      if (!userMap.has(username)) {
        userMap.set(username, {
          username,
          avatarUrl: commit.author.avatar_url,
          commits: 0,
          prsOpened: 0,
          prsMerged: 0,
          filesChanged: 0,
          linesAdded: 0,
          linesDeleted: 0,
          lastContribution: commit.commit.author.date,
          recentCommits: [],
        });
      }

      const stats = userMap.get(username)!;
      stats.commits++;
      if (stats.recentCommits.length < 3) {
        stats.recentCommits.push(commit.commit.message);
      }
      if (new Date(commit.commit.author.date) > new Date(stats.lastContribution)) {
        stats.lastContribution = commit.commit.author.date;
      }
    }

    const limitedCommits = commits.slice(0, 30);
    for (const commit of limitedCommits) {
      if (!commit.author || !commit.url) continue;
      const username = commit.author.login;
      const stats = userMap.get(username);
      if (stats) {
        // commit.url is the direct API URL to the commit
        const detailRes = await fetch(commit.url, { headers });
        if (detailRes.ok) {
          const detail = await detailRes.json();
          if (detail.stats) {
            stats.linesAdded += detail.stats.additions || 0;
            stats.linesDeleted += detail.stats.deletions || 0;
            stats.filesChanged += detail.files?.length || 0;
          }
        }
      }
    }

    for (const pr of prs) {
      const createdAt = new Date(pr.created_at);
      if (createdAt < sinceDate) continue;

      if (pr.user) {
        const username = pr.user.login;
        const stats = userMap.get(username);
        if (stats) {
          stats.prsOpened++;
        }
      }

      if (pr.merged_at && pr.merged_by) {
        const username = pr.merged_by.login;
        if (pr.user) {
          const stats = userMap.get(pr.user.login);
          if (stats) stats.prsMerged++;
        }
      }
    }

    const leaderboard = Array.from(userMap.values()).map(calculatePerformanceCategory);
    leaderboard.sort((a, b) => b.score - a.score);

    const trends = generateTrends(commits, prs, days);

    const data: GitHubAnalyticsData = {
      leaderboard,
      trends,
      insights: {
        topContributors: leaderboard.filter(u => u.category === "Overperforming").map(u => u.username),
        underperformers: leaderboard.filter(u => u.category === "Needs Attention").map(u => u.username),
        inactiveDevelopers: leaderboard.filter(u => u.category === "Recently Inactive").map(u => u.username),
        moduleOwnership: [
          { module: "src/components", owner: leaderboard[0]?.username || "N/A" },
          { module: "src/app/api", owner: leaderboard[1]?.username || leaderboard[0]?.username || "N/A" }
        ],
      }
    };

    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error("Failed to fetch GitHub data, falling back to mock:", error);
    return generateMockGitHubData(days);
  }
}

function calculatePerformanceCategory(metrics: GitHubUserMetrics) {
  const codeChurnScore = Math.min((metrics.linesAdded + metrics.linesDeleted) / 100, 50); 
  const consistencyScore = metrics.recentCommits.length * 5; 
  
  const score = Math.round(
    (metrics.commits * 1) + 
    (metrics.prsOpened * 10) + 
    (metrics.prsMerged * 15) + 
    codeChurnScore + 
    consistencyScore
  );

  let category = "Performing Well";
  let explanation = "Steady contributions and consistent code activity.";

  const daysSinceLastCommit = (Date.now() - new Date(metrics.lastContribution).getTime()) / (1000 * 3600 * 24);

  if (daysSinceLastCommit > 14) {
    category = "Recently Inactive";
    explanation = "Has not contributed code in the last two weeks.";
  } else if (score > 150) {
    category = "Overperforming";
    explanation = "High volume of commits, PRs, and significant code churn.";
  } else if (score < 30 && daysSinceLastCommit > 7) {
    category = "Needs Attention";
    explanation = "Low contribution score and limited recent activity.";
  }

  return {
    ...metrics,
    score,
    category,
    explanation,
  };
}

function generateTrends(commits: any[], prs: any[], days: number) {
  const trendsMap = new Map<string, { commits: number; prs: number }>();
  
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    trendsMap.set(dateStr, { commits: 0, prs: 0 });
  }

  for (const c of commits) {
    const d = c.commit.author.date.split("T")[0];
    if (trendsMap.has(d)) {
      trendsMap.get(d)!.commits++;
    }
  }

  for (const p of prs) {
    const d = p.created_at.split("T")[0];
    if (trendsMap.has(d)) {
      trendsMap.get(d)!.prs++;
    }
  }

  return Array.from(trendsMap.entries())
    .map(([date, counts]) => ({ date, ...counts }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function generateMockGitHubData(days: number): GitHubAnalyticsData {
  const mockUsers = [
    { username: "alice_dev", avatarUrl: "https://github.com/identicons/alice.png", commits: 45, prsOpened: 5, prsMerged: 4, linesAdded: 1200, linesDeleted: 400, lastContribution: new Date().toISOString() },
    { username: "bob_engineer", avatarUrl: "https://github.com/identicons/bob.png", commits: 12, prsOpened: 1, prsMerged: 1, linesAdded: 300, linesDeleted: 50, lastContribution: new Date(Date.now() - 3 * 86400000).toISOString() },
    { username: "charlie_coder", avatarUrl: "https://github.com/identicons/charlie.png", commits: 2, prsOpened: 0, prsMerged: 0, linesAdded: 20, linesDeleted: 5, lastContribution: new Date(Date.now() - 15 * 86400000).toISOString() },
  ];

  const leaderboard = mockUsers.map(u => calculatePerformanceCategory({
    ...u,
    filesChanged: Math.floor(Math.random() * 20),
    recentCommits: ["Fixed bug in auth", "Updated README", "Refactored UI components"].slice(0, Math.max(1, Math.floor(u.commits / 10))),
  }));
  leaderboard.sort((a, b) => b.score - a.score);

  const trends = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    trends.push({
      date: d.toISOString().split("T")[0],
      commits: Math.floor(Math.random() * 15),
      prs: Math.floor(Math.random() * 3),
    });
  }

  return {
    leaderboard,
    trends,
    insights: {
      topContributors: ["alice_dev"],
      underperformers: ["bob_engineer"],
      inactiveDevelopers: ["charlie_coder"],
      moduleOwnership: [
        { module: "src/components", owner: "alice_dev" },
        { module: "src/lib", owner: "bob_engineer" },
      ]
    }
  };
}

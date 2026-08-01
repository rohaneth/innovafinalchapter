# Parallel Development Rules

## Goal

Allow multiple developers or AI agents to work simultaneously with minimal merge conflicts.

Every task should be independently executable whenever possible.

---

# Core Principle

Before writing code, divide work by responsibility, not by feature.

Bad

Feature A
- frontend
- backend
- database

Feature B
- frontend
- backend
- database

Good

Developer 1
- authentication backend

Developer 2
- dashboard frontend

Developer 3
- notifications

Developer 4
- documentation

Each person owns a different area of the repository.

---

# Ownership

Each task must have exactly one owner.

No two developers should edit the same files unless absolutely necessary.

Example

Owner A
```
src/auth/**
```

Owner B
```
src/dashboard/**
```

Owner C
```
src/api/**
```

Owner D
```
docs/**
```

---

# Task Requirements

Every task should be

- independent
- compilable
- testable
- mergeable
- reversible

A task should not require unfinished work from another developer.

---

# Before Starting

Every developer should know

- objective
- owned folders
- expected outputs
- files allowed to modify
- dependencies
- completion criteria

---

# Allowed Changes

Only modify files inside your assigned scope.

If another file must be changed

1. document why
2. notify owner
3. keep change as small as possible

---

# Shared Files

Treat these as high-conflict files.

Examples

```
package.json
pom.xml
requirements.txt
Cargo.toml
build.gradle
docker-compose.yml
README.md
```

Only modify shared files when necessary.

Prefer one designated maintainer for shared configuration.

---

# API First

When two tasks depend on each other

Define interfaces first.

Examples

- REST endpoints
- GraphQL schema
- DTOs
- Interfaces
- Event contracts
- Database schema

Implementations can be completed independently afterwards.

---

# Database Changes

Database migrations should

- be additive
- avoid breaking existing code
- include rollback when possible

Avoid multiple developers editing the same migration.

---

# Git Strategy

Create one branch per task.

Example

```
feature/auth-login

feature/dashboard-ui

feature/payment-api

fix/cache-bug
```

Never work directly on main.

Merge frequently.

Resolve conflicts early.

---

# Commit Rules

One logical change per commit.

Good

```
Add JWT middleware

Implement dashboard widgets

Create notification service
```

Bad

```
misc fixes

updates

everything
```

---

# Pull Request Rules

Each PR should

- solve one problem
- be reviewable independently
- avoid unrelated changes

Smaller PRs merge faster.

---

# Communication

If blocked by another task

Do not wait.

Instead

- use mocks
- use interfaces
- create placeholder implementations
- document assumptions

---

# Conflict Prevention

Prefer creating new files instead of modifying existing ones.

Prefer extension over modification.

Example

Instead of editing

```
UserService
```

Create

```
UserNotificationService
```

if appropriate.

---

# Definition of Done

A task is complete when

- code builds
- tests pass
- no unrelated files changed
- documentation updated if needed
- no TODOs that block other tasks

---

# AI Agent Guidelines

An AI agent should

- stay inside assigned scope
- avoid refactoring unrelated code
- avoid formatting entire files
- avoid renaming files outside its ownership
- preserve existing APIs unless requested
- leave unrelated code untouched

---

# Golden Rule

When uncertain, create new files rather than modifying shared ones.

Minimize overlap.

Maximize independence.

Every task should be mergeable with minimal manual conflict resolution.
# Root Access — Project Guidelines

This document defines the standards that apply across **all** `root-access-*` repositories.
All contributors (human and AI) must adhere to these guidelines.

---

## Table of Contents

1. [Repository Naming & Splitting](#1-repository-naming--splitting)
2. [Code Guidelines (TypeScript / React)](#2-code-guidelines-typescript--react)
3. [Documentation Guidelines](#3-documentation-guidelines)
4. [CloudFormation Guidelines](#4-cloudformation-guidelines)
5. [Git & Branching](#5-git--branching)
6. [Tagging Strategy (AWS)](#6-tagging-strategy-aws)

---

## 1. Repository Naming & Splitting

### Naming Convention

All repositories for this project are prefixed with `root-access-`:

| Repository | Purpose |
|---|---|
| `root-access-ui` | React PWA frontend (the game client) |
| `root-access-infrastructure` | CloudFormation stacks for all AWS resources |
| `root-access-backend` | API / backend service (when needed) |

Additional services follow the same pattern: `root-access-<service-name>`.

### Splitting Rules

- Each **independently deployable unit** gets its own repository.
- Infrastructure lives exclusively in `root-access-infrastructure` — no CloudFormation in application repos.
- Shared type definitions stay in the repo that owns the domain; consumers duplicate or reference via package.

---

## 2. Code Guidelines (TypeScript / React)

### Language & Documentation

- **All comments, JSDoc, and README files are written in English.**
- No German in code or documentation (UI text / game content is exempt).

### File Size

- **Maximum 300 lines per file.** Split into smaller modules when approaching this limit.
- One primary export per file (class, component, or set of closely related pure functions).

### Folder Structure (root-access-ui)

```
src/
├── types/          # Shared TypeScript types and interfaces
├── engine/         # Pure game-logic functions (no React imports)
├── store/          # Zustand stores (state wiring only)
├── components/     # Reusable UI components
│   ├── hud/        # HUD elements (HP bar, integrity clock)
│   ├── narrative/  # Storylet / dialogue components
│   └── combat/     # Combat UI components
├── content/        # Handwritten game content (storylets, enemies)
└── assets/         # Static assets (images, fonts)
```

### Commenting

Every exported function or component must have a JSDoc block:

```typescript
/**
 * Evaluates whether all conditions in a list are satisfied by the current game state.
 *
 * @param state   - The current serializable game state.
 * @param conditions - Array of conditions to evaluate (AND semantics).
 * @returns `true` if every condition passes, `false` otherwise.
 */
export function evaluateAll(state: GameState, conditions: Condition[]): boolean { ... }
```

Inline comments are required for non-obvious logic. Prefer explaining *why*, not *what*:

```typescript
// Focus is refunded before the enemy turn so the player can chain Rollback
// without incurring the cost of the action being undone.
next.player.focus += FOCUS_COST[lastAction.kind]
```

### Architecture Rules

1. **Game logic = pure functions over serializable state.** No side effects, no React in `src/engine/`.
2. **Story = Storylets (QBN), never a hard-wired graph.** All narrative branching emerges from game values.
3. **Persistence = IndexedDB primary, `localStorage` never used as main storage.**
4. **No AI-generated story content in saved state.** Handwritten only.

---

## 3. Documentation Guidelines

### README Structure

Every repository README must follow this structure (in this order):

```
# <Repo Name> — <One-line description>

> <Project tagline>

## Overview
<2–3 paragraphs: what this repo does, why it exists, how it fits the larger system>

## Architecture
<Diagram or table of key components / stacks>

## Prerequisites
<Tools, accounts, environment variables required>

## Getting Started
<Step-by-step: clone → install → run>

## Development
<Dev server, tests, linting commands>

## Deployment
<How to deploy, including environment-specific steps>

## Repository Structure
<Annotated folder tree>

## Contributing
<Link to this CONTRIBUTING.md>
```

### Language & Tone

- Professional, technical, written for a developer audience.
- Present tense ("This stack creates…", not "This stack will create…").
- No marketing language.

---

## 4. CloudFormation Guidelines

### File Naming

Templates are numbered in **10-step increments** to allow insertion of future stacks:

```
cloudformation/
├── 010-iam.yaml
├── 020-storage.yaml
├── 030-certificate.yaml   # Must deploy to us-east-1
├── 040-cdn.yaml
├── 050-dns.yaml
└── README.md
```

Use steps of 10 so new stacks can be inserted (e.g. `025-waf.yaml`) without renumbering.

### Stack Naming

`root-access-{environment}-{component}`

Examples:
- `root-access-prod-iam`
- `root-access-prod-storage`
- `root-access-prod-cdn`

### Template Structure

Each template must follow this section order:

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Description: |
  Root Access — <Component>
  <One paragraph describing what this stack creates and why.>

Parameters:
  # ...

Conditions:
  # ...  (if any)

Resources:
  # ...

Outputs:
  # Expose all values consumed by other stacks
```

### Parameters

- All environment-specific values are parameters (never hardcoded).
- Parameters that are outputs of other stacks use `AWS::SSM::Parameter::Value` or are passed explicitly.
- Secrets are stored in Secrets Manager, never in template parameters or source control.

### Outputs

Every stack must export all values that other stacks or CI/CD pipelines may need:

```yaml
Outputs:
  BucketName:
    Description: "S3 bucket for root-access-ui static assets"
    Value: !Ref UIBucket
    Export:
      Name: !Sub "root-access-${Environment}-ui-bucket-name"
```

### Resource Naming

All resources use the `root-access-${Environment}-` prefix:

```yaml
UIBucket:
  Type: AWS::S3::Bucket
  Properties:
    BucketName: !Sub "root-access-${Environment}-ui"
```

### Accuracy Requirements

- Always use the **latest stable** CloudFormation resource type versions.
- Verify resource property names against the current AWS CloudFormation documentation before writing.
- Use `!Sub` for string interpolation, `!Ref` for same-template references, `!ImportValue` for cross-stack.

---

## 5. Git & Branching

| Branch | Purpose |
|---|---|
| `main` | Production-ready code. Protected. Deploys to prod on merge. |
| `develop` | Integration branch. Deploys to staging on merge. |
| `feature/<name>` | Feature work. PR targets `develop`. |
| `fix/<name>` | Bug fixes. PR targets `develop` (or `main` for hotfixes). |
| `infra/<name>` | Infrastructure changes (infra repo only). |

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(combat): add rollback action refund mechanic
fix(persistence): handle corrupted IndexedDB state gracefully
infra(cdn): add CloudFront cache invalidation on deploy
docs(readme): update deployment section for prod environment
```

---

## 6. Tagging Strategy (AWS)

All AWS resources must carry these tags:

| Tag Key | Value |
|---|---|
| `Project` | `root-access` |
| `Environment` | `prod` / `staging` / `dev` |
| `ManagedBy` | `cloudformation` |
| `Repository` | e.g. `root-access-infrastructure` |

Apply via CloudFormation `Tags` properties or stack-level tags.

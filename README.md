# root-access-ui

> A narrative, turn-based browser RPG — playable as a PWA on desktop and mobile.

## Overview

Root Access is a single-player narrative RPG in the tradition of *Disco Elysium* and *SOMA*.
The protagonist — Kade, a burned-out Principal Engineer — performs a Neural Dive into the AI
system he helped build to fix a security compromise, and encounters his own past in the process.

This repository contains the **game client**: a React Progressive Web App built with Vite.
It runs entirely in the browser; all game state is persisted locally via IndexedDB with
JSON export/import for cross-device transfers.

The infrastructure (S3, CloudFront, IAM) lives in
[root-access-infrastructure](https://github.com/fischermichael199/root-access-infrastructure).

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Browser / PWA                                           │
│                                                         │
│  src/                                                   │
│  ├── types/         Shared TypeScript types             │
│  ├── engine/        Pure game-logic functions           │
│  │   ├── conditions.ts   QBN condition evaluator        │
│  │   ├── effects.ts      State mutation functions       │
│  │   ├── storylets.ts    Narrative engine (QBN)         │
│  │   ├── combat.ts       Turn-based combat reducer      │
│  │   ├── persistence.ts  IndexedDB save/load            │
│  │   └── migrations.ts   Save-file version migrations   │
│  ├── store/         Zustand state wiring                │
│  ├── components/    React UI components                 │
│  └── content/       Handwritten game content            │
│                                                         │
│  Persistence: IndexedDB (primary) + JSON export         │
│  Offline: Workbox service worker (PWA)                  │
└─────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|---|---|
| Game logic = pure functions | Testable without a browser; fully serializable state |
| Storylets (QBN) not a node graph | Emergent branching from game values; no state-space explosion |
| IndexedDB over localStorage | iOS Safari PWA clears localStorage after ~7 days of inactivity |
| Deterministic combat (no RNG) | Rewards planning; reproducible for debugging |
| Handwritten story content only | AI-generated content would break narrative coherence and determinism |

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 5 | Type safety |
| Vite | 6 | Build tool + dev server |
| Tailwind CSS | 4 | Utility-first styling |
| Framer Motion | 11 | Animation |
| Zustand | 5 | State management |
| vite-plugin-pwa | 0.21 | PWA / Workbox service worker |

## Prerequisites

- Node.js ≥ 20
- npm ≥ 10

## Getting Started

```bash
git clone https://github.com/fischermichael199/root-access-ui.git
cd root-access-ui
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`.

## Development

```bash
npm run dev        # Start development server with HMR
npm run build      # Type-check + production build
npm run preview    # Preview production build locally
npm run lint       # ESLint
```

## Deployment

Deployment is fully automated via GitHub Actions on every merge to `main`:

1. **CI** (`ci.yml`) — runs type-check and build on every push and pull request.
2. **Deploy** (`deploy.yml`) — on merge to `main`, syncs the build output to S3
   and creates a CloudFront cache invalidation.

The deploy workflow assumes the AWS role defined in `root-access-infrastructure` via
OIDC (no long-lived credentials stored in GitHub Secrets).

Required GitHub Actions variables (set in repo Settings → Secrets and variables → Actions):

| Variable | Description |
|---|---|
| `AWS_ACCOUNT_ID` | AWS account number |
| `AWS_REGION` | Primary region (e.g. `eu-west-1`) |
| `AWS_DEPLOY_ROLE_ARN` | ARN of the deployment role (output of `010-iam.yaml`) |
| `S3_BUCKET_NAME` | Name of the UI assets bucket (output of `020-storage.yaml`) |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID (output of `040-cdn.yaml`) |

## Repository Structure

```
root-access-ui/
├── src/
│   ├── types/
│   │   └── index.ts          # All shared game types
│   ├── engine/
│   │   ├── conditions.ts     # QBN condition evaluator (pure)
│   │   ├── effects.ts        # Effect applicator (pure)
│   │   ├── storylets.ts      # Storylet filter + markSeen
│   │   ├── combat.ts         # Turn-based combat reducer (pure)
│   │   ├── persistence.ts    # IndexedDB + JSON export/import
│   │   └── migrations.ts     # Save-file version migration chain
│   ├── store/
│   │   └── gameStore.ts      # Zustand store wiring all engine modules
│   ├── components/           # React UI components (to be added)
│   └── content/              # Handwritten storylets and enemies (to be added)
├── public/                   # Static assets served as-is
├── .github/
│   └── workflows/
│       ├── ci.yml            # Type-check + build on PR
│       └── deploy.yml        # Deploy to S3 + CloudFront on main merge
├── vite.config.ts
├── tsconfig.json
├── CONTRIBUTING.md
└── README.md
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for code style, documentation standards, and branching strategy.

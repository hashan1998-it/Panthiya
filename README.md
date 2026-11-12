# Panthiya

[![CI](https://github.com/hashan1998-it/Panthiya/actions/workflows/ci.yaml/badge.svg)](https://github.com/hashan1998-it/Panthiya/actions/workflows/ci.yaml)

A tuition class management app for teachers: students, classes, attendance and monthly fees, with a read-only portal for students. Sinhala and English, light and dark themes.

**Live:** [panthiya-dev.vercel.app](https://panthiya-dev.vercel.app) · **Design tokens:** [/styleguide](https://panthiya-dev.vercel.app/styleguide)

> Work in progress. The plan and backlog are in [docs/PLAN.md](docs/PLAN.md), the design system in [docs/DESIGN.md](docs/DESIGN.md).

## Tech stack

Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase (Postgres, Auth, Row Level Security) · Vercel

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in the Supabase project URL and publishable key.

3. Start the dev server and open [http://localhost:3000](http://localhost:3000):

   ```bash
   npm run dev
   ```

## Scripts

| Script                 | What it does                     |
| ---------------------- | -------------------------------- |
| `npm run dev`          | Start the dev server             |
| `npm run build`        | Production build                 |
| `npm run lint`         | ESLint                           |
| `npm run typecheck`    | Generate route types, then `tsc` |
| `npm run format`       | Format with Prettier             |
| `npm run format:check` | Check formatting (used in CI)    |

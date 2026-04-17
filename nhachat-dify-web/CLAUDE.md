# Nhà Chát AI Sommelier

## What this is

AI wine consultant chatbot for **Nhà Chát** (Vietnamese wine retailer at nha-chat.com). Deployed on Vercel at **thechathouse.vn**. Current version: **V2.5.0**.

## Tech stack

- **Next.js 16.2.0** (Turbopack) / React 19 / TypeScript / Tailwind CSS 4
- **AI backend**: Google Gemini (`gemini-3-flash-preview`) via `@google/generative-ai` SDK
- **Database**: Neon Postgres via `@neondatabase/serverless` (question logging)
- **Deployment**: Vercel (manual `vercel --prod` from `nhachat-dify-web/`)

> **Next.js 16 has breaking changes.** Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Do not assume Next.js conventions from training data are current.

## Project structure

```
sommelier-ai/                        # Git repo root
├── nhachat-dify-web/                 # The Next.js app (Vercel project root)
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/chat/route.ts     # POST handler — Gemini streaming + question logging
│   │   │   ├── page.tsx              # Main page — multi-session chat, localStorage persistence
│   │   │   └── layout.tsx
│   │   ├── components/chat/
│   │   │   ├── ChatArea.tsx          # Core chat UI — streaming, parsing, product cards
│   │   │   ├── MessageInput.tsx      # Text input + send/stop
│   │   │   ├── WineCard.tsx          # Product card renderer
│   │   │   ├── FeedbackCollector.tsx  # Thumbs up/down (UI only, callback is console.log)
│   │   │   ├── SuggestedQuestions.tsx
│   │   │   ├── ProfileWizard.tsx
│   │   │   └── PairingWizard.tsx
│   │   ├── lib/
│   │   │   ├── db.ts                 # Neon client (exports sql tagged template)
│   │   │   ├── log-question.ts       # Fire-and-forget INSERT to questions table
│   │   │   └── utils.ts
│   │   └── types/chat.ts
│   ├── scripts/
│   │   ├── db-init.mjs              # One-shot schema applier
│   │   └── migrations/001_init.sql  # questions table DDL
│   ├── docs/ANALYTICS.md            # SQL cheatsheet for campaign analysis
│   └── .env.local                   # Local env (gitignored) — pull via `vercel env pull`
```

## Key architecture decisions

### API route (`route.ts`)
Unconditionally uses the Gemini SDK (`@google/generative-ai`). The env var names (`DIFY_API_KEY` / `NEXT_PUBLIC_DIFY_API_KEY`) are legacy — they hold the Gemini key. Rename is a follow-up coordinated with deploy.

### System prompt (hardcoded in `route.ts`)
The `SOMMELIER_SYSTEM_PROMPT` constant contains:
- 3-phase consultation flow (Elicitation → Analysis → Suggestion)
- Full 24-wine product catalog with IDs, prices, links, images, tasting notes
- Product Surfacing Rule: `<product_card>` tags allowed in BƯỚC 2 and 3 (not BƯỚC 1)
- Formatting laws (emoji bullets, markdown lists, spacing)

### Gemini config
- Model: `gemini-3-flash-preview`
- Thinking disabled: `thinkingConfig: { thinkingBudget: 0 }` (latency optimization)
- Output cap: `maxOutputTokens: 4096`
- Both set via `generationConfig` with `as any` cast (SDK types don't cover these fields yet)

### Streaming + product card parsing
- SSE streaming from Gemini → Vercel function → browser
- `parseAssistantResponse` in ChatArea strips `<product_card>` JSON tags and renders them as WineCard components
- Unclosed `<product_card>` tags are hidden during streaming to prevent raw JSON leaks

### Session persistence
- Chat sessions stored in browser `localStorage`
- Writes are skipped while streaming (`isLoading`), committed once stream ends

### Question logging (Neon Postgres)
- Every user message is INSERT'd via fire-and-forget (non-blocking)
- Captures: question, source (direct/shortcut/suggested_question/pairing_wizard/profile_welcome), session_id, msg_num, profile fields, user_agent, referrer
- Analysis queries documented in `docs/ANALYTICS.md`

## Environment variables

Required (pulled via `vercel env pull .env.local`):
- `NEXT_PUBLIC_DIFY_API_KEY` — Gemini API key (legacy name, rename pending)
- `DATABASE_URL` — Neon Postgres connection string (pooled)
- `DATABASE_URL_UNPOOLED` — for migrations

## Commands

```bash
cd nhachat-dify-web
npm run dev -- -p 4000       # Local dev
npm run build                # Production build
vercel --prod --yes          # Deploy to production
node --env-file=.env.local scripts/db-init.mjs  # Apply DB schema
```

## Deployment notes

- Vercel project root is `nhachat-dify-web/`, not the repo root
- GitHub auto-deploy is broken (Root Directory not configured on Vercel dashboard). Deploy manually via `vercel --prod`
- To fix auto-deploy: Vercel Settings → General → Root Directory → `nhachat-dify-web`

## Known limitations

- `FeedbackCollector` UI exists but `handleFeedback` only does `console.log` — not wired to storage
- Product catalog is hardcoded in the system prompt — no dynamic catalog API
- No auth on the chat endpoint — rate-limit via Vercel if needed

## Follow-up items

- Rename `DIFY_API_KEY` / `NEXT_PUBLIC_DIFY_API_KEY` → `GEMINI_API_KEY` (coordinated with Vercel env vars)
- Rename `nhachat-dify-web/` directory (breaks Vercel project root config + git history)

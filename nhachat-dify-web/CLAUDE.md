# Nhà Chát AI Sommelier

## What this is

AI wine consultant chatbot for **Nhà Chát** (Vietnamese wine retailer at nha-chat.com). Deployed on Vercel at **thechathouse.vn**. Current version: **V2.7**.

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
│   │   │   ├── api/chat/route.ts     # POST handler — Gemini streaming, function calling, question logging
│   │   │   ├── dev/elicitation-preview/page.tsx  # Dev-only UI preview for ElicitationCard
│   │   │   ├── page.tsx              # Main page — multi-session chat, localStorage persistence
│   │   │   └── layout.tsx
│   │   ├── components/chat/
│   │   │   ├── ChatArea.tsx          # Core chat UI — streaming, SSE parsing, elicitation wiring
│   │   │   ├── ElicitationCard.tsx   # Elicitation question card (options, freeform, skip)
│   │   │   ├── MessageInput.tsx      # Text input + send/stop
│   │   │   ├── WineCard.tsx          # Product card renderer
│   │   │   ├── FeedbackCollector.tsx # Thumbs up/down (UI only, callback is console.log)
│   │   │   ├── SuggestedQuestions.tsx
│   │   │   ├── ProfileWizard.tsx
│   │   │   └── PairingWizard.tsx
│   │   ├── lib/
│   │   │   ├── db.ts                 # Neon client (exports sql tagged template)
│   │   │   ├── log-question.ts       # Fire-and-forget INSERT to questions table
│   │   │   └── utils.ts
│   │   └── types/chat.ts             # Message discriminated union (TextMessage | ElicitationMessage)
│   ├── scripts/
│   │   ├── db-init.mjs              # One-shot schema applier
│   │   └── migrations/001_init.sql  # questions table DDL
│   ├── docs/ANALYTICS.md            # SQL cheatsheet for campaign analysis
│   ├── .env.example                 # Committed template for required env vars
│   └── .env.local                   # Local env (gitignored) — pull via `vercel env pull`
```

## Key architecture decisions

### API route (`route.ts`)
Uses the Gemini SDK unconditionally. The env var `NEXT_PUBLIC_DIFY_API_KEY` is a legacy name — it holds the Gemini key. Rename is a follow-up coordinated with deploy.

### System prompt (hardcoded in `route.ts`)
`SOMMELIER_SYSTEM_PROMPT` contains:
- Signal-based elicitation flow (V2.6): HIGH/MEDIUM/LOW signal taxonomy drives when to ask vs. recommend immediately
- Full 24-wine product catalog with IDs, prices, links, images, tasting notes
- `<product_card>` tags allowed in BƯỚC 2 and 3 only (not BƯỚC 1)
- Formatting laws (emoji bullets, markdown, no hyphens/em-dashes in prose)
- BƯỚC 2 elicitation section: `ask_elicitation_question` function call instructions and signal-priority ordering

### Gemini config
- Model: `gemini-3-flash-preview`
- Thinking disabled: `thinkingConfig: { thinkingBudget: 0 }` (latency optimization)
- Output cap: `maxOutputTokens: 4096`
- Both set via `generationConfig` with `as any` cast (SDK types don't cover these fields yet)

### Elicitation (V2.7 — feature-flagged)
- Controlled by `ENABLE_FUNCTION_CALL_ELICITATION=true` env var (default off in prod)
- When enabled: `ELICITATION_TOOL` (`ask_elicitation_question`) registered with Gemini, streaming loop detects `chunk.functionCalls()` and emits `event: "elicitation_question"` SSE events
- `ElicitationQuestion` payload: `question`, `question_type`, `options[]`, `allow_freeform`, `skippable`
- ChatArea handles the SSE event: validates payload, appends `ElicitationMessage` to state
- Submit handlers: `handleElicitationSelect` (source: `elicitation_option`), `handleElicitationFreeform` (source: `elicitation_freeform`), `handleElicitationSkip` (source: `elicitation_skip`, sends `"[Quý khách bỏ qua câu hỏi này]"` to model)
- Elicitation messages are UI-only — filtered out of history sent to Gemini
- Mid-interrupt: unanswered cards auto-dismiss when user types directly in MessageInput

### Message type system (`types/chat.ts`)
Discriminated union: `Message = TextMessage | ElicitationMessage`
- `TextMessage`: `role: "user" | "assistant"`, `content`, optional `productCards`, `suggestedQuestions`
- `ElicitationMessage`: `role: "elicitation"`, `payload: ElicitationQuestion`, `answered`, `answer?`
- Type guards: `isElicitation(msg)`, `isText(msg)` in ChatArea

### Streaming + product card parsing
- SSE streaming: Gemini → Vercel function → browser
- `parseAssistantResponse` in ChatArea strips `<product_card>` JSON tags → renders as WineCard components
- Unclosed tags suppressed during streaming to prevent raw JSON leaks

### Session persistence
- Chat sessions (including ElicitationMessage entries) stored in browser `localStorage`
- Writes skipped while streaming (`isLoading`), committed on stream end

### Question logging (Neon Postgres)
- Every user message INSERT'd fire-and-forget
- Captures: question, source, session_id, msg_num, profile fields, user_agent, referrer
- Sources include: `direct`, `shortcut`, `suggested_question`, `pairing_wizard`, `profile_welcome`, `elicitation_option`, `elicitation_freeform`, `elicitation_skip`
- Analysis queries in `docs/ANALYTICS.md`

## Environment variables

```
NEXT_PUBLIC_DIFY_API_KEY=          # Gemini API key (legacy name, rename pending)
DATABASE_URL=                      # Neon Postgres (pooled)
DATABASE_URL_UNPOOLED=             # Neon Postgres (for migrations)
ENABLE_FUNCTION_CALL_ELICITATION=  # true to enable function-call elicitation (default: false)
```

Pull from Vercel: `vercel env pull .env.local`

## Commands

```bash
cd nhachat-dify-web
npm run dev -- -p 4000                              # Local dev (default flag=off)
ENABLE_FUNCTION_CALL_ELICITATION=true npm run dev -- -p 4000  # With elicitation enabled
npm run build                                       # Production build
vercel --prod --yes                                 # Deploy to production
node --env-file=.env.local scripts/db-init.mjs      # Apply DB schema
```

## Deployment notes

- Vercel project root is `nhachat-dify-web/`, not the repo root
- GitHub auto-deploy is broken (Root Directory not configured on Vercel dashboard). Deploy manually via `vercel --prod`
- To fix auto-deploy: Vercel Settings → General → Root Directory → `nhachat-dify-web`

## Known limitations / follow-up items

- `FeedbackCollector` UI exists but `handleFeedback` only does `console.log` — not wired to storage
- Product catalog is hardcoded in the system prompt — no dynamic catalog API
- No auth on the chat endpoint
- `NEXT_PUBLIC_DIFY_API_KEY` rename → `GEMINI_API_KEY` pending (coordinated with Vercel env vars)
- `ENABLE_FUNCTION_CALL_ELICITATION` not yet set to `true` in Vercel prod — enable after live verification

# Question Log — Analytics Cheatsheet

Every user message hitting `/api/chat` is appended to the `questions` table in Neon Postgres.
Open the Neon SQL console via:

**Vercel Dashboard → Storage → (your Neon DB) → Open in Neon → SQL Editor**

## Schema

| column       | type         | meaning                                               |
|--------------|--------------|-------------------------------------------------------|
| `id`         | bigserial    | row id                                                |
| `created_at` | timestamptz  | when the question was received (UTC)                  |
| `session_id` | text         | Dify/Gemini conversation id (null on first turn)      |
| `msg_num`    | int          | 1-indexed position of the message in its session      |
| `question`   | text         | raw user input                                        |
| `source`     | text         | `direct` · `shortcut` · `suggested_question` · `pairing_wizard` · `profile_welcome` |
| `has_profile`| boolean      | user completed the gu/profile wizard                  |
| `occasion`   | text         | profile: dịp dùng                                     |
| `intensity`  | text         | profile: đậm/nhạt                                     |
| `sweetness`  | text         | profile: ngọt/chát                                    |
| `user_agent` | text         | browser UA (useful to split mobile vs desktop)        |
| `referrer`   | text         | HTTP referer — includes utm params when ads land here |

## Campaign queries

### Top organic questions (last 7 days)

Filter out template-sourced messages so only real user-typed questions show up.

```sql
SELECT question, COUNT(*) AS freq
FROM questions
WHERE source = 'direct'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY question
ORDER BY freq DESC
LIMIT 50;
```

### Opening questions — what users ask first

These are the highest-signal rows for ad copy and homepage hero messaging.

```sql
SELECT question, COUNT(*) AS freq
FROM questions
WHERE msg_num = 1 AND source = 'direct'
GROUP BY question
ORDER BY freq DESC
LIMIT 30;
```

### Traffic by referrer (campaign tracking)

```sql
SELECT
  COALESCE(NULLIF(referrer, ''), '(direct)') AS landing,
  COUNT(DISTINCT session_id) AS unique_sessions,
  COUNT(*) AS total_msgs
FROM questions
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY landing
ORDER BY unique_sessions DESC;
```

### Funnel depth per session

How deep do users go? Long conversations = engaged users.

```sql
SELECT session_id, MAX(msg_num) AS depth
FROM questions
WHERE created_at > NOW() - INTERVAL '7 days'
  AND session_id IS NOT NULL
GROUP BY session_id
ORDER BY depth DESC
LIMIT 50;
```

### Profile completion lift

Does completing the gu wizard change engagement?

```sql
SELECT
  has_profile,
  COUNT(DISTINCT session_id) AS sessions,
  AVG(depth) AS avg_depth
FROM (
  SELECT session_id, has_profile, MAX(msg_num) AS depth
  FROM questions
  WHERE session_id IS NOT NULL
  GROUP BY session_id, has_profile
) s
GROUP BY has_profile;
```

### Daily volume

```sql
SELECT DATE(created_at) AS day, COUNT(*) AS msgs, COUNT(DISTINCT session_id) AS sessions
FROM questions
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY day
ORDER BY day DESC;
```

## Export

In the Neon SQL Editor, run any query and click **Export → CSV**.

## Rotating the connection string

If the connection string leaks, regenerate it in the Neon dashboard
(Project → Settings → Reset Password) and run `vercel env pull .env.local`
after Vercel re-syncs the integration.

## Adding a column later

```sql
ALTER TABLE questions ADD COLUMN response_preview TEXT;
```

Then update `src/lib/log-question.ts` and `src/app/api/chat/route.ts`.

# ReachInbox Email Scheduler

A TypeScript monorepo for persistent, delayed email delivery with BullMQ, Redis, Postgres, Ethereal SMTP, Elasticsearch indexing, and a React dashboard.

## Run locally

Prerequisites: Node 20+, Docker Desktop, and npm.

```bash
docker compose up -d
copy backend\.env.example backend\.env
npm install
npm run db:generate
npm run db:push
npm run dev
```

The dashboard runs at `http://localhost:5173`, the API at `http://localhost:4000`, and the BullMQ monitor at `http://localhost:4000/admin/queues`.

Set `ETHEREAL_USER` and `ETHEREAL_PASS` in `backend/.env` using an account from [Ethereal Email](https://ethereal.email/). Without credentials, queue behavior and lifecycle state still run, but SMTP delivery will fail and be marked `failed`.

## Architecture

- `POST /api/emails/schedule` stores every recipient as a relational `Email` row before enqueueing a BullMQ delayed job. The email ID is the BullMQ job ID, making scheduling idempotent.
- Redis and BullMQ persist future jobs independently of the Node process. Restarting the API/worker reconnects to the same queue; jobs are not recreated from day one.
- The worker uses configurable `WORKER_CONCURRENCY` and a shared `MIN_SEND_DELAY_MS` throttle. A Redis Lua script atomically reserves a sender/hour slot using `MAX_EMAILS_PER_HOUR`; if the window is full, the job is re-enqueued for the next hour instead of dropped.
- Delivered messages transition `SCHEDULED -> PROCESSING -> SENT`; failures are recorded with a reason and retried by BullMQ with exponential backoff. The worker skips already-sent rows for idempotency.
- Elasticsearch receives an index document on schedule and after delivery. `GET /api/emails/search?q=...` searches recipient, subject, or body.
- Bull Board provides live queue visibility at `/admin/queues`.

## OAuth and Slack

The demo dashboard has a local operator identity so the full scheduling flow works immediately. For a deployment, configure Google OAuth credentials and wire `/auth/google` and `/auth/google/callback` to a session-backed Passport strategy. Configure Slack OAuth credentials and persist the returned team token against the authenticated `User`; rate-limit events can then POST a message to Slack when a sender exhausts its Redis hour window. OAuth client IDs, secrets, callback URLs, and session secrets belong in environment variables, never source control.

## Frontend features

The React dashboard provides scheduled/sent tabs, loading and empty states, user profile header, a responsive layout, CSV/text lead parsing, duplicate email removal, validation, start time selection, minimum send delay selection, and API-backed scheduling.

## Trade-offs

The sample uses one global hourly limit per sender and a local demo user so the assignment can be run without OAuth setup. For a multi-tenant deployment, authenticate every API request, associate sender configuration with a tenant, encrypt stored provider tokens, protect Bull Board, and add a dedicated Slack notification outbox for guaranteed notification delivery.

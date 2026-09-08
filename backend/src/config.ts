import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 4000),
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  workerConcurrency: Number(process.env.WORKER_CONCURRENCY ?? 5),
  minSendDelayMs: Number(process.env.MIN_SEND_DELAY_MS ?? 2000),
  maxEmailsPerHour: Number(process.env.MAX_EMAILS_PER_HOUR ?? 200),
  etherealUser: process.env.ETHEREAL_USER,
  etherealPass: process.env.ETHEREAL_PASS,
  elasticsearchUrl: process.env.ELASTICSEARCH_URL ?? 'http://localhost:9200',
  sessionSecret: process.env.SESSION_SECRET ?? 'development-only-secret',
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:4000/auth/google/callback',
  slackClientId: process.env.SLACK_CLIENT_ID,
  slackClientSecret: process.env.SLACK_CLIENT_SECRET,
  slackRedirectUri: process.env.SLACK_REDIRECT_URI ?? 'http://localhost:4000/auth/slack/callback',
};

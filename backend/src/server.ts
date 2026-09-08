```ts
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { config } from './config.js';
import { prisma } from './db.js';
import { emailQueue, enqueueEmail } from './queue.js';
import { indexEmail, searchEmails } from './search.js';
import './worker.js';

const app = express();

app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: 'lax',
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) =>
  done(null, user as Express.User)
);

if (config.googleClientId && config.googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.googleClientId,
        clientSecret: config.googleClientSecret,
        callbackURL: config.googleCallbackUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await prisma.user.upsert({
            where: {
              email:
                profile.emails?.[0]?.value ??
                `${profile.id}@google.local`,
            },
            update: {
              name: profile.displayName,
              avatarUrl: profile.photos?.[0]?.value,
              googleId: profile.id,
            },
            create: {
              email:
                profile.emails?.[0]?.value ??
                `${profile.id}@google.local`,
              name: profile.displayName,
              avatarUrl: profile.photos?.[0]?.value,
              googleId: profile.id,
            },
          });

          done(null, user);
        } catch (error) {
          done(error as Error);
        }
      }
    )
  );
}

const bullBoardAdapter = new ExpressAdapter();

bullBoardAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullMQAdapter(emailQueue)],
  serverAdapter: bullBoardAdapter,
});

app.use('/admin/queues', bullBoardAdapter.getRouter());

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
  });
});

app.get('/api/me', async (_req, res) => {
  const user = await prisma.user.upsert({
    where: {
      email: 'demo@reachinbox.local',
    },
    update: {},
    create: {
      email: 'demo@reachinbox.local',
      name: 'Demo Operator',
      avatarUrl: 'https://i.pravatar.cc/96?img=12',
    },
  });

  res.json({
    user,
  });
});

app.get('/api/emails', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      email: 'demo@reachinbox.local',
    },
  });

  if (!user) {
    return res.json({
      emails: [],
    });
  }

  const status =
    typeof req.query.status === 'string'
      ? req.query.status
      : undefined;

  const emails = await prisma.email.findMany({
    where: {
      userId: user.id,
      ...(status
        ? {
            status: status as never,
          }
        : {}),
    },
    orderBy: {
      scheduledAt: 'asc',
    },
  });

  res.json({
    emails,
  });
});

app.get('/api/emails/search', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      email: 'demo@reachinbox.local',
    },
  });

  const query =
    typeof req.query.q === 'string'
      ? req.query.q
      : '';

  res.json({
    emails:
      user && query
        ? await searchEmails(user.id, query)
        : [],
  });
});

app.post('/api/emails/schedule', async (req, res) => {
  const {
    subject,
    body,
    recipients,
    startTime,
    delayBetweenMs = config.minSendDelayMs,
    sender = 'demo@ethereal.email',
  } = req.body as {
    subject?: string;
    body?: string;
    recipients?: string[];
    startTime?: string;
    delayBetweenMs?: number;
    sender?: string;
  };

  if (
    !subject ||
    !body ||
    !Array.isArray(recipients) ||
    !recipients.length ||
    !startTime
  ) {
    return res.status(400).json({
      error:
        'subject, body, recipients and startTime are required',
    });
  }

  const normalizedRecipients = Array.from(
    new Set(
      recipients.flatMap(
        (value) =>
          value.match(
            /[^\s@",]+@[^\s@",]+\.[^\s@",]+/g
          ) ?? []
      )
    )
  );

  if (!normalizedRecipients.length) {
    return res.status(400).json({
      error:
        'At least one valid email address is required',
    });
  }

  const user = await prisma.user.upsert({
    where: {
      email: 'demo@reachinbox.local',
    },
    update: {},
    create: {
      email: 'demo@reachinbox.local',
      name: 'Demo Operator',
    },
  });

  const start = new Date(startTime);

  const emails = await prisma.$transaction(
    normalizedRecipients.map((recipient, index) =>
      prisma.email.create({
        data: {
          userId: user.id,
          recipient,
          subject,
          body,
          sender,
          scheduledAt: new Date(
            start.getTime() +
              index *
                Math.max(
                  delayBetweenMs,
                  config.minSendDelayMs
                )
          ),
        },
      })
    )
  );

  await Promise.all(
    emails.map((email: (typeof emails)[number]) =>
      enqueueEmail(
        email.id,
        email.sender,
        email.scheduledAt
      ).then(() => indexEmail(email))
    )
  );

  res.status(201).json({
    emails,
  });
});

app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${config.frontendUrl}/?auth=failed`,
  }),
  (_req, res) =>
    res.redirect(config.frontendUrl)
);

app.get('/auth/slack', (req, res) => {
  if (!config.slackClientId) {
    return res.status(501).json({
      error:
        'Configure Slack OAuth credentials in backend/.env.',
    });
  }

  const params = new URLSearchParams({
    client_id: config.slackClientId,
    scope: 'chat:write',
    redirect_uri: config.slackRedirectUri,
    state: String(req.sessionID),
  });

  res.redirect(
    `https://slack.com/oauth/v2/authorize?${params}`
  );
});

app.get('/auth/slack/callback', async (req, res) => {
  if (
    !config.slackClientId ||
    !config.slackClientSecret ||
    typeof req.query.code !== 'string'
  ) {
    return res
      .status(400)
      .send('Slack authorization was not completed.');
  }

  const response = await fetch(
    'https://slack.com/api/oauth.v2.access',
    {
      method: 'POST',
      headers: {
        'Content-Type':
          'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: config.slackClientId,
        client_secret: config.slackClientSecret,
        code: req.query.code,
        redirect_uri: config.slackRedirectUri,
      }),
    }
  );

  const data = (await response.json()) as {
    ok: boolean;
    access_token?: string;
    team?: {
      id: string;
    };
  };

  if (data.ok && data.access_token) {
    await prisma.user.update({
      where: {
        email: 'demo@reachinbox.local',
      },
      data: {
        slackToken: data.access_token,
        slackTeam: data.team?.id,
      },
    });
  }

  res.redirect(config.frontendUrl);
});

/*
 * IMPORTANT FOR RENDER:
 * Render provides the PORT environment variable automatically.
 * The server must bind to 0.0.0.0 instead of localhost.
 */
const PORT = Number(process.env.PORT) || config.port || 4000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(
    `ReachInbox API listening on http://${HOST}:${PORT}`
  );
});
```

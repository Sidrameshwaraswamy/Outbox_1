import { redis } from './queue.js';
import { config } from './config.js';
import { prisma } from './db.js';

const reserveScript = `
  local count = redis.call('INCR', KEYS[1])
  if count == 1 then redis.call('EXPIRE', KEYS[1], 7200) end
  if count > tonumber(ARGV[1]) then
    redis.call('DECR', KEYS[1])
    return 0
  end
  return 1
`;

export async function reserveHourlySlot(sender: string, at = new Date()) {
  const hour = new Date(at);
  hour.setMinutes(0, 0, 0);
  const key = `rate:${sender}:${hour.toISOString()}`;
  const result = await redis.eval(reserveScript, 1, key, config.maxEmailsPerHour);
  return { allowed: result === 1, nextHour: new Date(hour.getTime() + 60 * 60 * 1000) };
}

export async function notifySlackRateLimit(sender: string) {
  const user = await prisma.user.findUnique({ where: { email: sender } });
  if (!user?.slackToken) return;
  await fetch('https://slack.com/api/chat.postMessage', { method: 'POST', headers: { Authorization: `Bearer ${user.slackToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ channel: user.slackTeam, text: `Hourly email limit reached for ${sender}. Delivery has been moved to the next available hour.` }) });
}

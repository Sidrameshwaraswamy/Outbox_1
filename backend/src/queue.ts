import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { config } from './config.js';

export const redis = new IORedis(config.redisUrl, { maxRetriesPerRequest: null });
export const emailQueue = new Queue('email-delivery', { connection: redis });

export type DeliveryJob = { emailId: string; sender: string };

export async function enqueueEmail(emailId: string, sender: string, scheduledAt: Date) {
  const delay = Math.max(0, scheduledAt.getTime() - Date.now());
  await emailQueue.add('deliver-email', { emailId, sender } satisfies DeliveryJob, {
    jobId: emailId,
    delay,
    attempts: 5,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  });
}

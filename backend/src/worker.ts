import { Worker } from 'bullmq';
import nodemailer from 'nodemailer';
import { config } from './config.js';
import { prisma } from './db.js';
import { emailQueue, redis, type DeliveryJob } from './queue.js';
import { indexEmail } from './search.js';
import { notifySlackRateLimit, reserveHourlySlot } from './rateLimit.js';

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: config.etherealUser && config.etherealPass ? { user: config.etherealUser, pass: config.etherealPass } : undefined,
});

let lastSendAt = 0;

function extractRecipient(value: string): string {
  return value.match(/[^\s@",]+@[^\s@",]+\.[^\s@",]+/)?.[0] ?? value;
}

export const worker = new Worker<DeliveryJob>('email-delivery', async (job) => {
  const email = await prisma.email.findUnique({ where: { id: job.data.emailId } });
  if (!email || email.status === 'SENT') return;

  const recipient = extractRecipient(email.recipient);
  if (recipient !== email.recipient) {
    await prisma.email.update({ where: { id: email.id }, data: { recipient } });
  }

  const slot = await reserveHourlySlot(email.sender);
  if (!slot.allowed) {
    await notifySlackRateLimit(email.sender).catch(() => undefined);
    await emailQueue.add('deliver-email', job.data, { jobId: `${email.id}:${slot.nextHour.toISOString()}`, delay: slot.nextHour.getTime() - Date.now(), attempts: 5, backoff: { type: 'exponential', delay: 5000 } });
    return;
  }

  const wait = Math.max(0, config.minSendDelayMs - (Date.now() - lastSendAt));
  if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
  lastSendAt = Date.now();
  await prisma.email.update({ where: { id: email.id }, data: { status: 'PROCESSING' } });

  try {
    await transporter.sendMail({ from: email.sender, to: recipient, subject: email.subject, text: email.body });
    const sent = await prisma.email.update({ where: { id: email.id }, data: { status: 'SENT', sentAt: new Date() } });
    await indexEmail(sent);
  } catch (error) {
    await prisma.email.update({ where: { id: email.id }, data: { status: 'FAILED', failureReason: error instanceof Error ? error.message : 'Delivery failed' } });
    throw error;
  }
}, { connection: redis, concurrency: config.workerConcurrency });

worker.on('error', (error) => console.error('Worker error:', error));
worker.on('failed', async (job, error) => {
  if (!job || job.attemptsMade < (job.opts.attempts ?? 1)) return;
  await prisma.email.update({
    where: { id: job.data.emailId },
    data: { status: 'FAILED', failureReason: error.message },
  }).catch((updateError) => console.error('Failed to update email status:', updateError));
});

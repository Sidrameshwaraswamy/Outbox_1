import { Client } from '@elastic/elasticsearch';
import { config } from './config.js';

const client = new Client({ node: config.elasticsearchUrl });
const index = 'emails';

export async function indexEmail(email: { id: string; userId: string; recipient: string; subject: string; status: string; scheduledAt: Date; sentAt: Date | null }) {
  try {
    await client.index({ index, id: email.id, document: { ...email, scheduledAt: email.scheduledAt.toISOString(), sentAt: email.sentAt?.toISOString() ?? null }, refresh: 'wait_for' });
  } catch (error) {
    console.warn('Elasticsearch indexing skipped:', error instanceof Error ? error.message : error);
  }
}

export async function searchEmails(userId: string, query: string) {
  try {
    const result = await client.search({ index, query: { bool: { must: [{ multi_match: { query, fields: ['recipient', 'subject', 'body'] } }], filter: [{ term: { userId } }] } } });
    return result.hits.hits.map((hit) => hit._source);
  } catch {
    return [];
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function parseEmailsFromText(text: string): string[] {
  const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
  const emails = text.match(emailRegex) || [];
  return Array.from(new Set(emails));
}

export function extractEmailAddress(value: string): string {
  return value.match(/[^\s@",]+@[^\s@",]+\.[^\s@",]+/)?.[0] ?? value;
}

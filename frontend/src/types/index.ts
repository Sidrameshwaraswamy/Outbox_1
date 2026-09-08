// User and Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  avatarUrl?: string;
}

// Email Types
export interface Email {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: string;
  sentAt?: string;
  status: 'SCHEDULED' | 'SENT' | 'FAILED' | 'PENDING';
}

export interface ScheduleEmailRequest {
  subject: string;
  body: string;
  recipients: string[];
  startTime: string;
  delayBetweenMs: number;
  hourlyLimit?: number;
}

export interface EmailsResponse {
  emails: Email[];
  total: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
}

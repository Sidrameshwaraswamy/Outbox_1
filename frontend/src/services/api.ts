import axios, { AxiosInstance } from 'axios';
import type { Email, EmailsResponse, ScheduleEmailRequest, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests if available
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Auth endpoints
  async getMe(): Promise<User | null> {
    try {
      const response = await this.client.get<{ user: User }>('/me');
      return response.data.user;
    } catch {
      return null;
    }
  }

  async loginWithGoogle(token: string): Promise<User> {
    const response = await this.client.post<{ user: User; token: string }>('/auth/google', {
      token,
    });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data.user;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
    }
  }

  // Email endpoints
  async getEmails(status: 'SCHEDULED' | 'SENT', search?: string): Promise<EmailsResponse> {
    const params = new URLSearchParams({ status });
    if (search) params.append('search', search);
    
    const response = await this.client.get<EmailsResponse>('/emails', { params });
    return response.data;
  }

  async scheduleEmails(payload: ScheduleEmailRequest): Promise<{ success: boolean; count: number }> {
    const response = await this.client.post('/emails/schedule', payload);
    return response.data;
  }

  async getScheduledEmails(search?: string): Promise<EmailsResponse> {
    return this.getEmails('SCHEDULED', search);
  }

  async getSentEmails(search?: string): Promise<EmailsResponse> {
    return this.getEmails('SENT', search);
  }
}

export const apiClient = new ApiClient();

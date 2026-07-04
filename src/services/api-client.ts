// REST API Client for Customer App

export class APIClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request(method: string, endpoint: string, data?: any) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  // Auth
  register(email: string, password: string) {
    return this.request('POST', '/api/auth/register', { email, password, role: 'customer' });
  }

  login(email: string, password: string) {
    return this.request('POST', '/api/auth/login', { email, password });
  }

  refreshToken(refreshToken: string) {
    return this.request('POST', '/api/auth/refresh', { refresh_token: refreshToken });
  }

  // Customer Profile
  getProfile(customerId: string) {
    return this.request('GET', `/api/admin/customers/${customerId}`);
  }

  updateProfile(customerId: string, data: any) {
    return this.request('PUT', `/api/admin/customers/${customerId}`, data);
  }

  // Products
  getProducts() {
    return this.request('GET', '/api/admin/products');
  }

  // Promotions
  getPromotions() {
    return this.request('GET', '/api/admin/promotions');
  }

  // Notifications
  getNotifications(customerId: string) {
    return this.request('GET', `/api/notifications/${customerId}`);
  }

  createNotification(customerId: string, data: any) {
    return this.request('POST', `/api/notifications/${customerId}`, data);
  }
}

export const apiClient = new APIClient();

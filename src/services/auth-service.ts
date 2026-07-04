// Authentication Service - Handles JWT tokens and session management

export interface AuthToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    role: 'customer';
  };
}

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRES_KEY = 'token_expires';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class AuthService {
  private refreshTimeout?: NodeJS.Timeout;
  private listeners = new Set<(user: AuthToken['user'] | null) => void>();

  setToken(token: AuthToken) {
    localStorage.setItem(TOKEN_KEY, token.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, token.refresh_token);
    localStorage.setItem(TOKEN_EXPIRES_KEY, (Date.now() + token.expires_in * 1000).toString());
    this.scheduleTokenRefresh(token.expires_in);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  async logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_KEY);
    
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    this.notifyListeners(null);
  }

  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem(TOKEN_EXPIRES_KEY);
    if (!expiresAt) return true;
    return Date.now() >= parseInt(expiresAt);
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) return false;

      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) throw new Error('Token refresh failed');

      const newToken: AuthToken = await response.json();
      this.setToken(newToken);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.logout();
      return false;
    }
  }

  private scheduleTokenRefresh(expiresIn: number) {
    if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
    
    // Refresh 1 minute before expiry
    const refreshIn = Math.max((expiresIn - 60) * 1000, 0);
    this.refreshTimeout = setTimeout(() => this.refreshToken(), refreshIn);
  }

  subscribe(callback: (user: AuthToken['user'] | null) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(user: AuthToken['user'] | null) {
    this.listeners.forEach(listener => listener(user));
  }
}

export const authService = new AuthService();

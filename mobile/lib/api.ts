import * as SecureStore from 'expo-secure-store';

const API_URL = __DEV__ ? 'http://localhost:3000/api' : 'https://your-api.com/api';

class ApiClient {
  private token: string | null = null;

  async init() {
    this.token = await SecureStore.getItemAsync('auth_token');
  }

  async setToken(token: string | null) {
    this.token = token;
    if (token) {
      await SecureStore.setItemAsync('auth_token', token);
    } else {
      await SecureStore.deleteItemAsync('auth_token');
    }
  }

  async getToken() {
    if (!this.token) {
      this.token = await SecureStore.getItemAsync('auth_token');
    }
    return this.token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${path}`, { ...options, headers });

    if (response.status === 401) {
      await this.setToken(null);
      throw new Error('UNAUTHORIZED');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro de rede' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  get<T>(path: string) {
    return this.request<T>(path);
  }

  post<T>(path: string, data?: unknown) {
    return this.request<T>(path, { method: 'POST', body: JSON.stringify(data) });
  }

  put<T>(path: string, data?: unknown) {
    return this.request<T>(path, { method: 'PUT', body: JSON.stringify(data) });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

export const api = new ApiClient();

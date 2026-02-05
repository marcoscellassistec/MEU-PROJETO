import { create } from 'zustand';
import { api } from './api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  subscription?: {
    status: string;
    endDate: string;
    plan: { name: string; features: string[] };
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const data = await api.post<{ user: User; token: string }>('/auth/login', { email, password });
    await api.setToken(data.token);
    set({ user: data.user, isAuthenticated: true });
  },

  register: async (name, email, password) => {
    const data = await api.post<{ user: User; token: string }>('/auth/register', { name, email, password });
    await api.setToken(data.token);
    set({ user: data.user, isAuthenticated: true });
  },

  logout: async () => {
    await api.setToken(null);
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      await api.init();
      const token = await api.getToken();
      if (token) {
        const user = await api.get<User>('/auth/me');
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      await api.setToken(null);
      set({ isLoading: false });
    }
  },
}));

export interface Transaction {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  date: string;
  category: { id: string; name: string; icon: string; color: string };
}

export interface Summary {
  income: number;
  expense: number;
  balance: number;
  byCategory: Array<{ name: string; total: number; color: string; icon: string }>;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  icon: string;
  color: string;
  isCompleted: boolean;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: string;
  recurrence: string;
  category?: { name: string; icon: string; color: string };
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'INCOME' | 'EXPENSE';
}

export interface Plan {
  id: string;
  name: string;
  description?: string;
  monthlyPrice: number;
  annualPrice: number;
  annualDiscount: number;
  trialDays: number;
  features: string[];
}

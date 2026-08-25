import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<User>;
  guestLogin: () => void;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
}

const MOCK_USERS: Record<UserRole, User> = {
  admin: {
    id: 'usr_admin_001',
    email: 'admin@fairness.ai',
    name: 'Admin User',
    role: 'admin',
    organization: 'AI Research Lab',
    createdAt: '2025-01-10T09:00:00Z',
    lastLogin: new Date().toISOString(),
  },
  researcher: {
    id: 'usr_res_001',
    email: 'researcher@fairness.ai',
    name: 'Dr. Researcher',
    role: 'researcher',
    organization: 'Dept. of AI, ML & DS',
    createdAt: '2025-02-15T10:30:00Z',
    lastLogin: new Date().toISOString(),
  },
  student: {
    id: 'usr_stu_001',
    email: 'student@fairness.ai',
    name: 'Student User',
    role: 'student',
    organization: 'Final Year Project Team',
    createdAt: '2025-03-20T14:00:00Z',
    lastLogin: new Date().toISOString(),
  },
  guest: {
    id: 'usr_guest',
    email: 'guest@fairness.ai',
    name: 'Guest User',
    role: 'guest',
    createdAt: new Date().toISOString(),
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isGuest: false,
      login: async (email: string, _password: string, role: UserRole) => {
        await new Promise((r) => setTimeout(r, 800));
        const user = MOCK_USERS[role];
        const token = 'jwt_' + Math.random().toString(36).slice(2, 32);
        set({ user, token, isAuthenticated: true, isGuest: false });
        return user;
      },
      guestLogin: () => {
        set({ user: MOCK_USERS.guest, token: null, isAuthenticated: true, isGuest: true });
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, isGuest: false });
      },
      updateUser: (patch) =>
        set((s) => ({ user: s.user ? { ...s.user, ...patch } : s.user })),
    }),
    { name: 'fa_auth_store' },
  ),
);

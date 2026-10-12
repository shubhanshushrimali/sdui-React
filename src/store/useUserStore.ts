import { create } from 'zustand';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
  avatar: string;
  tier: 'free' | 'pro' | 'enterprise';
  walletBalance: number;
  [key: string]: unknown;
}

interface UserState {
  user: UserProfile;
  togglePremium: () => void;
  updateUser: (partial: Partial<UserProfile>) => void;
  addBalance: (amount: number) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: {
    id: 'usr_8829',
    name: 'Shubhanshu Shrimali',
    email: 'shubhanshu@example.com',
    isPremium: false,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    tier: 'free',
    walletBalance: 250,
  },
  togglePremium: () =>
    set((state) => ({
      user: {
        ...state.user,
        isPremium: !state.user.isPremium,
        tier: !state.user.isPremium ? 'pro' : 'free',
      },
    })),
  updateUser: (partial) =>
    set((state) => ({
      user: { ...state.user, ...partial },
    })),
  addBalance: (amount) =>
    set((state) => ({
      user: { ...state.user, walletBalance: state.user.walletBalance + amount },
    })),
}));

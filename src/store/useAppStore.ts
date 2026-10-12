import { create } from 'zustand';
import { SDUIScreen } from '../sdui/types';

interface AppState {
  schemas: Record<string, SDUIScreen>;
  liveCustomSchema: string | null; // For the live SDUI Editor
  activeCategory: string;
  cartCount: number;
  likedItemIds: string[];
  setSchema: (screenId: string, schema: SDUIScreen) => void;
  setLiveCustomSchema: (jsonStr: string | null) => void;
  setActiveCategory: (cat: string) => void;
  incrementCart: () => void;
  toggleLike: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  schemas: {},
  liveCustomSchema: null,
  activeCategory: 'All',
  cartCount: 2,
  likedItemIds: ['item_1'],
  setSchema: (screenId, schema) =>
    set((state) => ({
      schemas: { ...state.schemas, [screenId]: schema },
    })),
  setLiveCustomSchema: (jsonStr) => set({ liveCustomSchema: jsonStr }),
  setActiveCategory: (cat) => set({ activeCategory: cat }),
  incrementCart: () => set((state) => ({ cartCount: state.cartCount + 1 })),
  toggleLike: (id) =>
    set((state) => ({
      likedItemIds: state.likedItemIds.includes(id)
        ? state.likedItemIds.filter((item) => item !== id)
        : [...state.likedItemIds, id],
    })),
}));

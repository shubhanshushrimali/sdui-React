import { create } from 'zustand';
import { SDUIScreen } from '../sdui/types';

export interface BottomSheetState {
  title: string;
  message?: string;
  primaryLabel?: string;
}

interface AppState {
  schemas: Record<string, SDUIScreen>;
  liveCustomSchema: string | null; // For the live SDUI Editor
  activeCategory: string;
  cartCount: number;
  likedItemIds: string[];
  /** Schema-defined keys. Any screen can read these through dataSource.stateKey. */
  values: Record<string, unknown>;
  bottomSheet: BottomSheetState | null;
  setSchema: (screenId: string, schema: SDUIScreen) => void;
  setLiveCustomSchema: (jsonStr: string | null) => void;
  setActiveCategory: (cat: string) => void;
  setStateValue: (key: string, value: unknown) => void;
  incrementCart: () => void;
  toggleLike: (id: string) => void;
  openBottomSheet: (sheet: BottomSheetState) => void;
  dismissBottomSheet: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  schemas: {},
  liveCustomSchema: null,
  activeCategory: 'All',
  cartCount: 2,
  likedItemIds: ['item_1'],
  values: {},
  bottomSheet: null,
  setSchema: (screenId, schema) =>
    set((state) => ({
      schemas: { ...state.schemas, [screenId]: schema },
    })),
  setLiveCustomSchema: (jsonStr) => set({ liveCustomSchema: jsonStr }),
  setActiveCategory: (cat) =>
    set((state) => ({
      activeCategory: cat,
      values: { ...state.values, activeCategory: cat },
    })),
  setStateValue: (key, value) =>
    set((state) => {
      const values = { ...state.values, [key]: value };
      if (key === 'activeCategory' && typeof value === 'string') {
        return { activeCategory: value, values };
      }
      if (key === 'cartCount' && typeof value === 'number') {
        return { cartCount: value, values };
      }
      return { values };
    }),
  incrementCart: () => set((state) => ({ cartCount: state.cartCount + 1 })),
  toggleLike: (id) =>
    set((state) => ({
      likedItemIds: state.likedItemIds.includes(id)
        ? state.likedItemIds.filter((item) => item !== id)
        : [...state.likedItemIds, id],
    })),
  openBottomSheet: (sheet) => set({ bottomSheet: sheet }),
  dismissBottomSheet: () => set({ bottomSheet: null }),
}));

export function selectSDUIValue(state: AppState, stateKey?: string): unknown {
  if (!stateKey) return undefined;
  if (Object.prototype.hasOwnProperty.call(state.values, stateKey)) {
    return state.values[stateKey];
  }
  return (state as unknown as Record<string, unknown>)[stateKey];
}

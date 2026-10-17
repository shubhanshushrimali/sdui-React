import { create } from 'zustand';

interface EngineState {
  activeCategory: string;
  cartCount: number;
  likedItemIds: string[];
  /** Schema-defined keys. Lists read these through dataSource.stateKey. */
  values: Record<string, unknown>;
  setStateValue: (key: string, value: unknown) => void;
  incrementCart: () => void;
  toggleLike: (id: string) => void;
}

export const useEngineStore = create<EngineState>((set) => ({
  activeCategory: 'All',
  cartCount: 0,
  likedItemIds: [],
  values: {},
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
}));

export function selectSDUIValue(state: EngineState, stateKey?: string): unknown {
  if (!stateKey) return undefined;
  if (Object.prototype.hasOwnProperty.call(state.values, stateKey)) {
    return state.values[stateKey];
  }
  return (state as unknown as Record<string, unknown>)[stateKey];
}

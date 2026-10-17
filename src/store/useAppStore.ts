import { create } from 'zustand';
import type { SDUIScreen } from '@sdui/react';

export interface BottomSheetState {
  title: string;
  message?: string;
  primaryLabel?: string;
}

interface AppState {
  schemas: Record<string, SDUIScreen>;
  liveCustomSchema: string | null;
  bottomSheet: BottomSheetState | null;
  setSchema: (screenId: string, schema: SDUIScreen) => void;
  setLiveCustomSchema: (jsonStr: string | null) => void;
  openBottomSheet: (sheet: BottomSheetState) => void;
  dismissBottomSheet: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  schemas: {},
  liveCustomSchema: null,
  bottomSheet: null,
  setSchema: (screenId, schema) =>
    set((state) => ({
      schemas: { ...state.schemas, [screenId]: schema },
    })),
  setLiveCustomSchema: (jsonStr) => set({ liveCustomSchema: jsonStr }),
  openBottomSheet: (sheet) => set({ bottomSheet: sheet }),
  dismissBottomSheet: () => set({ bottomSheet: null }),
}));

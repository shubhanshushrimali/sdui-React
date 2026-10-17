import { configure, registerAction } from '@sdui/react';
import { fetchSDUIScreen } from './services/schemaService';
import { useAppStore } from './store/useAppStore';
import { useUserStore } from './store/useUserStore';

configure({
  allowedOrigins: ['images.unsplash.com', 'github.com'],
});

registerAction('showBottomSheet', (action) => {
  const payload = action.payload ?? {};
  useAppStore.getState().openBottomSheet({
    title: String(payload.title ?? 'Details'),
    message: payload.message != null ? String(payload.message) : undefined,
    primaryLabel: payload.primaryLabel != null ? String(payload.primaryLabel) : 'Done',
  });
});

registerAction('prefetch', (action) => {
  const screenId = action.payload?.screen ? String(action.payload.screen) : '';
  if (screenId) {
    fetchSDUIScreen(screenId).catch(() => {});
  }
});

registerAction('toggleMember', () => {
  useUserStore.getState().togglePremium();
});

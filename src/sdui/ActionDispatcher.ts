/**
 * Action Dispatcher (Enterprise Edition)
 *
 * Handles action objects, sequential action pipelines (chaining),
 * prefetching, state mutation, and external triggers.
 */

import { Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { SDUIAction, SDUINode, SDUITemplateContext } from './types';
import { resolveActionPayload } from './TemplateResolver';
import { fetchSDUIScreen } from '../services/schemaService';
import { useAppStore } from '../store/useAppStore';
import { trackNodeClick } from './analytics';

type ActionHandler = (
  action: SDUIAction,
  context: SDUITemplateContext
) => void | Promise<void>;

// ─── Built-in Action Handlers ──────────────────────────────────────

const builtinHandlers: Record<string, ActionHandler> = {
  navigate: (action) => {
    const payload = action.payload;
    if (!payload?.screen) {
      console.warn('[SDUI] Navigate action missing "screen" in payload');
      return;
    }
    const screen = String(payload.screen);
    const params = (payload.params as Record<string, string>) ?? {};

    const queryString = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');

    const path = queryString ? `/${screen}?${queryString}` : `/${screen}`;
    router.push(path as never);
  },

  goBack: () => {
    if (router.canGoBack()) {
      router.back();
    }
  },

  openUrl: async (action) => {
    const payload = action.payload;
    if (!payload?.url) {
      console.warn('[SDUI] openUrl action missing "url" in payload');
      return;
    }
    const url = String(payload.url);
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      console.warn(`[SDUI] Cannot open URL: ${url}`);
    }
  },

  apiCall: async (action, context) => {
    const payload = action.payload;
    if (!payload?.url) {
      console.warn('[SDUI] apiCall action missing "url" in payload');
      return;
    }
    try {
      const response = await fetch(String(payload.url), {
        method: (payload.method as string) ?? 'GET',
        headers: (payload.headers as Record<string, string>) ?? {
          'Content-Type': 'application/json',
        },
        body: payload.body ? JSON.stringify(payload.body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('[SDUI] API response success:', data);

      if (action.onSuccess) {
        dispatchAction(action.onSuccess, { ...context, apiResponse: data });
      }
    } catch (error: any) {
      console.error('[SDUI] API call failed:', error);
      if (action.onError) {
        dispatchAction(action.onError, { ...context, error: error?.message });
      }
    }
  },

  showToast: (action) => {
    const payload = action.payload;
    const message = String(payload?.message ?? 'Action triggered');
    const title = String(payload?.title ?? '');
    Alert.alert(title, message);
  },

  showBottomSheet: (action) => {
    const payload = action.payload ?? {};
    useAppStore.getState().openBottomSheet({
      title: String(payload.title ?? 'Details'),
      message: payload.message != null ? String(payload.message) : undefined,
      primaryLabel: payload.primaryLabel != null ? String(payload.primaryLabel) : 'Done',
    });
  },

  setState: (action) => {
    const payload = action.payload;
    if (!payload) return;
    const store = useAppStore.getState();

    if (payload.incrementCart) store.incrementCart();
    if (typeof payload.toggleLike === 'string') store.toggleLike(payload.toggleLike);

    for (const [key, value] of Object.entries(payload)) {
      if (key === 'incrementCart' || key === 'toggleLike') continue;
      store.setStateValue(key, value);
    }
  },

  // ⛓️ Action Pipelines (Sequential Chaining)
  chain: async (action, context) => {
    if (!action.steps || !Array.isArray(action.steps)) {
      console.warn('[SDUI] Chain action missing "steps" array');
      return;
    }

    for (const step of action.steps) {
      await dispatchAction(step, context);
    }
  },

  // 🚀 Background Schema Prefetching
  prefetch: (action) => {
    const screenId = action.payload?.screen ? String(action.payload.screen) : null;
    if (screenId) {
      fetchSDUIScreen(screenId).catch(() => {});
    }
  },

  dismiss: () => {
    if (router.canGoBack()) {
      router.back();
    }
  },

  noop: () => {},
};

// ─── Custom Handler Registry ──────────────────────────────────────

const customHandlers = new Map<string, ActionHandler>();

export function registerActionHandler(
  actionType: string,
  handler: ActionHandler
): void {
  customHandlers.set(actionType, handler);
}

/**
 * Dispatch an SDUI action. Resolves template variables in the payload,
 * then finds and executes the appropriate handler.
 */
export async function dispatchAction(
  action: SDUIAction,
  context: SDUITemplateContext
): Promise<void> {
  const resolvedPayload = resolveActionPayload(action.payload, context);
  const actionWithResolvedPayload: SDUIAction = {
    ...action,
    payload: resolvedPayload,
  };

  const customHandler = customHandlers.get(action.type);
  if (customHandler) {
    await customHandler(actionWithResolvedPayload, context);
    return;
  }

  const builtinHandler = builtinHandlers[action.type];
  if (builtinHandler) {
    await builtinHandler(actionWithResolvedPayload, context);
    return;
  }

  console.warn(`[SDUI] Unknown action type: "${action.type}"`);
}

export function createActionHandler(
  action: SDUIAction | undefined,
  context: SDUITemplateContext,
  source?: Pick<SDUINode, 'id' | 'type' | 'analytics'>
): (() => void) | undefined {
  if (!action && !source?.analytics?.clickEvent) return undefined;
  return () => {
    if (source) trackNodeClick(source);
    if (action) void dispatchAction(action, context);
  };
}

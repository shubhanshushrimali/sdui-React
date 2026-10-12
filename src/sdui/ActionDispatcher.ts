/**
 * Action Dispatcher
 *
 * Handles action objects from SDUI schemas. Maps action types
 * to actual navigation, API calls, state changes, and more.
 */

import { Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { SDUIAction, SDUITemplateContext } from './types';
import { resolveActionPayload } from './TemplateResolver';

type ActionHandler = (
  payload: Record<string, unknown> | undefined,
  context: SDUITemplateContext
) => void | Promise<void>;

// ─── Built-in Action Handlers ──────────────────────────────────────

const builtinHandlers: Record<string, ActionHandler> = {
  navigate: (payload) => {
    if (!payload?.screen) {
      console.warn('[SDUI] Navigate action missing "screen" in payload');
      return;
    }
    const screen = String(payload.screen);
    const params = (payload.params as Record<string, string>) ?? {};

    // Build path with params for Expo Router
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

  openUrl: async (payload) => {
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

  apiCall: async (payload) => {
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
      const data = await response.json();
      console.log('[SDUI] API response:', data);

      // Optionally call a success callback
      if (payload.onSuccess && typeof payload.onSuccess === 'string') {
        dispatchAction(
          { type: payload.onSuccess as SDUIAction['type'], payload: data },
          {}
        );
      }
    } catch (error) {
      console.error('[SDUI] API call failed:', error);
    }
  },

  showToast: (payload) => {
    const message = String(payload?.message ?? 'Something happened');
    const title = String(payload?.title ?? '');
    Alert.alert(title, message);
  },

  setState: (payload, _context) => {
    // This will be wired into Zustand — placeholder for now
    console.log('[SDUI] setState action:', payload);
  },

  showBottomSheet: (payload) => {
    console.log('[SDUI] showBottomSheet:', payload);
    // Will be implemented with a BottomSheet component
  },

  dismiss: () => {
    if (router.canGoBack()) {
      router.back();
    }
  },

  noop: () => {
    // Intentional no-op
  },
};

// ─── Custom Handler Registry ──────────────────────────────────────

const customHandlers = new Map<string, ActionHandler>();

/**
 * Register a custom action handler.
 * Use this to extend the SDUI action system with app-specific actions.
 */
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
export function dispatchAction(
  action: SDUIAction,
  context: SDUITemplateContext
): void {
  const resolvedPayload = resolveActionPayload(action.payload, context);

  // Check custom handlers first (allows overriding builtins)
  const customHandler = customHandlers.get(action.type);
  if (customHandler) {
    customHandler(resolvedPayload, context);
    return;
  }

  // Fall back to built-in handlers
  const builtinHandler = builtinHandlers[action.type];
  if (builtinHandler) {
    builtinHandler(resolvedPayload, context);
    return;
  }

  console.warn(`[SDUI] Unknown action type: "${action.type}"`);
}

/**
 * Create an event handler function from an SDUI action.
 * This returns a callback that can be passed directly to onPress, etc.
 */
export function createActionHandler(
  action: SDUIAction | undefined,
  context: SDUITemplateContext
): (() => void) | undefined {
  if (!action) return undefined;
  return () => dispatchAction(action, context);
}

import { createElement } from 'react';
import { SDUIRenderer, type SDUIRendererProps } from './sdui/SDUIRenderer';
import { componentRegistry } from './sdui/ComponentRegistry';
import { listActionTypes, registerActionHandler, type ActionHandler } from './sdui/ActionDispatcher';
import type { SDUIComponent, SDUIScreen } from './sdui/types';
import { configureRuntime, screenGuardReason, type EngineConfig } from './sdui/runtime';
import { subscribeSDUIAnalytics, trackSDUIEvent } from './sdui/analytics';
export type { SDUIAnalyticsEvent } from './sdui/analytics';

export function render(props: SDUIRendererProps) {
  return createElement(SDUIRenderer, { ...props, guard: true });
}

export function registerComponent(type: string, component: SDUIComponent): void {
  componentRegistry.register(type, component);
}

export function registerAction(type: string, handler: ActionHandler): void {
  registerActionHandler(type, handler);
}

export function configure(config: EngineConfig): void {
  configureRuntime(config);
}

export function clientCapabilities(): { components: string[]; actions: string[] } {
  return {
    components: componentRegistry.componentNames(),
    actions: listActionTypes(),
  };
}

export function acceptScreen(
  screen: SDUIScreen,
  byteLength?: number
): { ok: true } | { ok: false; reason: string } {
  const reason = screenGuardReason(screen, clientCapabilities(), byteLength);
  return reason ? { ok: false, reason } : { ok: true };
}

export { subscribeSDUIAnalytics, trackSDUIEvent };

export type { EngineConfig };

export type { SDUIRendererProps as RenderProps };
export type {
  SDUIAction,
  SDUIComponent,
  SDUINode,
  SDUIScreen,
  SDUITemplateContext,
} from './sdui/types';

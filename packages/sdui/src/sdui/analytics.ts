/**
 * Single analytics sink for SDUI impressions and clicks.
 * Subscribe to forward events to a real provider. Dev logging stays here.
 */

export interface SDUIAnalyticsEvent {
  kind: 'impression' | 'click';
  name: string;
  nodeId?: string;
  nodeType?: string;
  properties?: Record<string, unknown>;
}

type AnalyticsListener = (event: SDUIAnalyticsEvent) => void;

const listeners = new Set<AnalyticsListener>();

export function subscribeSDUIAnalytics(listener: AnalyticsListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function trackSDUIEvent(event: SDUIAnalyticsEvent): void {
  if (typeof __DEV__ === 'undefined' || __DEV__) {
    console.log(`[SDUI] ${event.kind} "${event.name}"`, {
      nodeId: event.nodeId,
      nodeType: event.nodeType,
      ...event.properties,
    });
  }

  listeners.forEach((listener) => {
    try {
      listener(event);
    } catch (error) {
      console.warn('[SDUI] Analytics listener failed:', error);
    }
  });
}

export function trackNodeClick(node: {
  id?: string;
  type: string;
  analytics?: {
    clickEvent?: string;
    properties?: Record<string, unknown>;
  };
}): void {
  const name = node.analytics?.clickEvent;
  if (!name) return;

  trackSDUIEvent({
    kind: 'click',
    name,
    nodeId: node.id,
    nodeType: node.type,
    properties: node.analytics?.properties,
  });
}

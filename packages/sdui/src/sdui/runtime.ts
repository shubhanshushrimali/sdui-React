import { missingCapabilities, type CapabilitySet } from './capabilities';
import { isUrlAllowed as matchUrl, normalizeOrigin } from './urlPolicy';
import {
  DEFAULT_TREE_LIMITS,
  rejectScreen,
  rejectTree,
  type TreeLimits,
} from './treeLimits';

export interface EngineConfig {
  allowedOrigins?: string[];
  maxNodes?: number;
  maxDepth?: number;
  maxBytes?: number;
}

let origins: string[] = [];
let limits: TreeLimits = { ...DEFAULT_TREE_LIMITS };

export function configureRuntime(config: EngineConfig): void {
  if (config.allowedOrigins) {
    origins = config.allowedOrigins.map(normalizeOrigin).filter((origin) => origin.length > 0);
  }
  limits = {
    maxNodes: config.maxNodes ?? limits.maxNodes,
    maxDepth: config.maxDepth ?? limits.maxDepth,
    maxBytes: config.maxBytes ?? limits.maxBytes,
  };
}

export function getAllowedOrigins(): readonly string[] {
  return origins;
}

export function getLimits(): TreeLimits {
  return limits;
}

export function isUrlAllowed(raw: string): boolean {
  return matchUrl(raw, origins);
}

export function allowedImageUri(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const uri = value.trim();
  if (!uri || uri.includes('{{')) return null;
  return isUrlAllowed(uri) ? uri : null;
}

export function screenGuardReason(
  screen: { root?: unknown; overlay?: unknown[]; metadata?: { requires?: CapabilitySet } },
  client: CapabilitySet,
  byteLength?: number
): string | null {
  const size = rejectScreen(screen, limits, byteLength);
  if (size) return size;
  const missing = missingCapabilities(screen.metadata?.requires, client);
  if (missing.length > 0) return `client is missing ${missing.join(', ')}`;
  return null;
}

export function nodeGuardReason(node: unknown): string | null {
  return rejectTree(node, limits);
}

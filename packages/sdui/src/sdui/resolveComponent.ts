export function normalizeComponentType(type: string): string {
  return type.toLowerCase();
}

/**
 * Primary type wins. An unknown type may degrade to fallbackType.
 * `has` must apply the same normalization as the registry.
 */
export function resolveComponentName(
  has: (type: string) => boolean,
  type: string,
  fallbackType?: string
): { type: string; degraded: boolean } | null {
  if (has(type)) return { type, degraded: false };
  if (fallbackType && has(fallbackType)) return { type: fallbackType, degraded: true };
  return null;
}

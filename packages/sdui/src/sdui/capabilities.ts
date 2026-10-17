export interface CapabilitySet {
  components?: string[];
  actions?: string[];
}

export function missingCapabilities(
  requires: CapabilitySet | undefined,
  client: CapabilitySet
): string[] {
  if (!requires) return [];

  const components = new Set((client.components ?? []).map((name) => name.toLowerCase()));
  const actions = new Set(client.actions ?? []);
  const missing: string[] = [];

  for (const name of requires.components ?? []) {
    if (!components.has(name.toLowerCase())) missing.push(`component ${name}`);
  }
  for (const name of requires.actions ?? []) {
    if (!actions.has(name)) missing.push(`action ${name}`);
  }
  return missing;
}

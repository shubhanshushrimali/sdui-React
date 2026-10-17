export interface TreeLimits {
  maxNodes: number;
  maxDepth: number;
  maxBytes: number;
}

export const DEFAULT_TREE_LIMITS: TreeLimits = {
  maxNodes: 2000,
  maxDepth: 32,
  maxBytes: 512 * 1024,
};

export interface TreeSize {
  nodes: number;
  depth: number;
}

export function measureTree(node: unknown): TreeSize {
  let nodes = 0;
  let depth = 0;

  const walk = (value: unknown, level: number) => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) {
      for (const item of value) walk(item, level);
      return;
    }

    const record = value as Record<string, unknown>;
    if (typeof record.type !== 'string') return;

    nodes += 1;
    depth = Math.max(depth, level);
    if (Array.isArray(record.children)) {
      for (const child of record.children) walk(child, level + 1);
    }
    walk(record.itemTemplate, level + 1);
    walk(record.ifTrue, level + 1);
    walk(record.ifFalse, level + 1);
  };

  walk(node, 1);
  return { nodes, depth };
}

export function measureScreen(screen: { root?: unknown; overlay?: unknown[] }): TreeSize {
  const root = measureTree(screen.root);
  let nodes = root.nodes;
  let depth = root.depth;
  for (const node of screen.overlay ?? []) {
    const part = measureTree(node);
    nodes += part.nodes;
    depth = Math.max(depth, part.depth);
  }
  return { nodes, depth };
}

export function rejectTree(node: unknown, limits: TreeLimits): string | null {
  const size = measureTree(node);
  if (size.nodes > limits.maxNodes) {
    return `schema has ${size.nodes} nodes; limit is ${limits.maxNodes}`;
  }
  if (size.depth > limits.maxDepth) {
    return `schema is ${size.depth} nodes deep; limit is ${limits.maxDepth}`;
  }
  return null;
}

export function rejectScreen(
  screen: { root?: unknown; overlay?: unknown[] },
  limits: TreeLimits,
  byteLength?: number
): string | null {
  const bytes = byteLength ?? JSON.stringify(screen).length;
  if (bytes > limits.maxBytes) {
    return `schema is ${bytes} bytes; limit is ${limits.maxBytes}`;
  }
  const size = measureScreen(screen);
  if (size.nodes > limits.maxNodes) {
    return `schema has ${size.nodes} nodes; limit is ${limits.maxNodes}`;
  }
  if (size.depth > limits.maxDepth) {
    return `schema is ${size.depth} nodes deep; limit is ${limits.maxDepth}`;
  }
  return null;
}

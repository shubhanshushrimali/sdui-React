import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ZodType } from 'zod';
import { SDUI_COMPONENT_TYPES } from './catalog';
import {
  SDUIActionSchema,
  SDUIConditionSchema,
  SDUIDataSourceSchema,
  SDUIListFilterSchema,
  SDUIScreenSchema,
  validateSDUIScreen,
} from './SchemaValidator';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

type ZodLike = ZodType & {
  def?: {
    type?: string;
    shape?: Record<string, ZodLike>;
    innerType?: ZodLike;
    element?: ZodLike;
    valueType?: ZodLike;
    getter?: () => ZodLike;
    entries?: Record<string, string>;
  };
};

function concrete(schema: ZodLike | undefined, seen: Set<unknown>): ZodLike | undefined {
  if (!schema || seen.has(schema)) return undefined;
  seen.add(schema);
  const def = schema.def;
  if (!def) return schema;
  if (def.type === 'lazy' && typeof def.getter === 'function') {
    return concrete(def.getter(), seen);
  }
  if ((def.type === 'optional' || def.type === 'default' || def.type === 'nullable') && def.innerType) {
    return concrete(def.innerType, seen);
  }
  return schema;
}

function collectShapeKeys(schema: ZodLike | undefined, keys: Set<string>, seen = new Set<unknown>()) {
  const current = concrete(schema, seen);
  const def = current?.def;
  if (!def) return;

  if (def.shape) {
    for (const [key, child] of Object.entries(def.shape)) {
      keys.add(key);
      collectShapeKeys(child, keys, seen);
    }
  }
  if (def.type === 'array' && def.element) collectShapeKeys(def.element, keys, seen);
  if (def.type === 'record' && def.valueType) collectShapeKeys(def.valueType, keys, seen);
}

function enumOptions(schema: ZodLike | undefined): string[] {
  const current = concrete(schema, new Set());
  const entries = current?.def?.entries;
  return entries ? Object.keys(entries) : [];
}

export function contractSurface() {
  const keys = new Set<string>();
  collectShapeKeys(SDUIScreenSchema as unknown as ZodLike, keys);

  const seen = new Set<unknown>();
  const screen = concrete(SDUIScreenSchema as unknown as ZodLike, seen);
  const metadata = concrete(screen?.def?.shape?.metadata, new Set());
  const action = concrete(SDUIActionSchema as unknown as ZodLike, new Set());
  const condition = concrete(SDUIConditionSchema as unknown as ZodLike, new Set());
  const dataSource = concrete(SDUIDataSourceSchema as unknown as ZodLike, new Set());
  const filter = concrete(SDUIListFilterSchema as unknown as ZodLike, new Set());

  return {
    keys,
    components: [...SDUI_COMPONENT_TYPES],
    actions: enumOptions(action?.def?.shape?.type),
    cachePolicies: enumOptions(metadata?.def?.shape?.cachePolicy),
    transitions: enumOptions(metadata?.def?.shape?.transition),
    dataSourceTypes: enumOptions(dataSource?.def?.shape?.type),
    methods: enumOptions(dataSource?.def?.shape?.method),
    operators: [
      ...new Set([
        ...enumOptions(condition?.def?.shape?.operator),
        ...enumOptions(filter?.def?.shape?.operator),
      ]),
    ],
  };
}

function visit(
  value: unknown,
  keys: Set<string>,
  valuesByKey: Map<string, Set<string>>
) {
  if (Array.isArray(value)) {
    for (const item of value) visit(item, keys, valuesByKey);
    return;
  }
  if (!value || typeof value !== 'object') return;

  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    keys.add(key);
    if (typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean') {
      const bucket = valuesByKey.get(key) ?? new Set<string>();
      bucket.add(String(child));
      valuesByKey.set(key, bucket);
    } else {
      visit(child, keys, valuesByKey);
    }
  }
}

export function auditDocuments(documents: unknown[]): string[] {
  const surface = contractSurface();
  const keys = new Set<string>();
  const valuesByKey = new Map<string, Set<string>>();
  const invalid: string[] = [];

  documents.forEach((document, index) => {
    const validation = validateSDUIScreen(document);
    if (!validation.success) {
      invalid.push(`document ${index + 1} failed schema validation`);
    }
    visit(document, keys, valuesByKey);
  });

  const gaps: string[] = [...invalid];
  const typeValues = valuesByKey.get('type') ?? new Set<string>();

  for (const key of surface.keys) {
    if (!keys.has(key)) gaps.push(`schema field "${key}" has no fixture`);
  }
  for (const component of surface.components) {
    if (!typeValues.has(component)) gaps.push(`component "${component}" has no fixture`);
  }
  for (const action of surface.actions) {
    if (!typeValues.has(action)) gaps.push(`action "${action}" has no fixture`);
  }

  const expectValues = (field: string, expected: string[]) => {
    const present = valuesByKey.get(field) ?? new Set<string>();
    for (const value of expected) {
      if (!present.has(value)) gaps.push(`${field} "${value}" has no fixture`);
    }
  };

  expectValues('cachePolicy', surface.cachePolicies);
  expectValues('transition', surface.transitions);
  expectValues('type', surface.dataSourceTypes);
  expectValues('method', surface.methods);
  expectValues('operator', surface.operators);

  return gaps;
}

export function loadSchemaDocuments(dir = path.join(projectRoot, 'src', 'schemas')): unknown[] {
  const documents: unknown[] = [];
  const visitDir = (current: string) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        visitDir(full);
        continue;
      }
      if (entry.name.endsWith('.json')) {
        documents.push(JSON.parse(fs.readFileSync(full, 'utf8')));
      }
    }
  };
  visitDir(dir);
  return documents;
}

export function auditSchemaFixtures(): string[] {
  return auditDocuments(loadSchemaDocuments());
}

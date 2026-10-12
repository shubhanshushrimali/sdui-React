/**
 * Template Resolver
 *
 * Resolves template expressions like {{user.name}} or {{item.price}}
 * from the provided context object. Supports nested property access.
 */

import { SDUITemplateContext } from './types';

/**
 * Resolve a single dot-notation path from context.
 * e.g., "user.name" → context.user.name
 */
function resolvePathValue(context: SDUITemplateContext, path: string): unknown {
  const keys = path.trim().split('.');
  let current: unknown = context;

  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Resolve all {{template}} expressions in a string.
 *
 * Examples:
 *   "Hello, {{user.name}}!" → "Hello, John!"
 *   "Price: ${{item.price}}" → "Price: $29.99"
 *   "{{user.name}}" → "John" (returns raw value if entire string is a single expression)
 */
export function resolveTemplate(
  template: unknown,
  context: SDUITemplateContext
): unknown {
  if (typeof template !== 'string') return template;

  // Check if the entire string is a single template expression
  // In that case, return the raw value (could be a number, boolean, object)
  const singleExprMatch = /^\{\{(.+?)\}\}$/.exec(template);
  if (singleExprMatch) {
    const value = resolvePathValue(context, singleExprMatch[1]);
    return value !== undefined ? value : template;
  }

  // Otherwise, do string interpolation for mixed content
  return template.replace(/\{\{(.+?)\}\}/g, (match, path: string) => {
    const value = resolvePathValue(context, path);
    if (value === undefined || value === null) return match; // keep original if not found
    return String(value);
  });
}

/**
 * Recursively resolve all template expressions in a props object.
 */
export function resolveProps(
  props: Record<string, unknown> | undefined,
  context: SDUITemplateContext
): Record<string, unknown> {
  if (!props) return {};

  const resolved: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'string') {
      resolved[key] = resolveTemplate(value, context);
    } else if (Array.isArray(value)) {
      resolved[key] = value.map((item) =>
        typeof item === 'string' ? resolveTemplate(item, context) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      resolved[key] = resolveProps(
        value as Record<string, unknown>,
        context
      );
    } else {
      resolved[key] = value;
    }
  }

  return resolved;
}

/**
 * Resolve template expressions in an SDUIAction's payload.
 */
export function resolveActionPayload(
  payload: Record<string, unknown> | undefined,
  context: SDUITemplateContext
): Record<string, unknown> | undefined {
  if (!payload) return undefined;
  return resolveProps(payload, context);
}

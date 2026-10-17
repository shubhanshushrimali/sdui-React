/**
 * Conditional Evaluator
 *
 * Evaluates conditions from SDUI schema to determine which branch to render.
 * Supports template expressions and comparison operators.
 */

import { SDUICondition, SDUITemplateContext } from './types';
import { resolveTemplate } from './TemplateResolver';

/**
 * Evaluate a condition expression against the current template context.
 *
 * Examples:
 *   { expression: "{{user.isPremium}}" } → true/false based on user.isPremium
 *   { expression: "{{user.age}}", operator: "gte", value: 18 } → true if age >= 18
 *   { expression: "{{user.role}}", operator: "eq", value: "admin" } → true if role === "admin"
 */
export function evaluateCondition(
  condition: SDUICondition,
  context: SDUITemplateContext
): boolean {
  try {
    const resolvedValue = resolveTemplate(condition.expression, context);
    const operator = condition.operator ?? 'truthy';
    const compareValue = condition.value;

    switch (operator) {
      case 'truthy':
        return Boolean(resolvedValue);

      case 'falsy':
        return !resolvedValue;

      case 'eq':
        return resolvedValue === compareValue;

      case 'neq':
        return resolvedValue !== compareValue;

      case 'gt':
        return Number(resolvedValue) > Number(compareValue);

      case 'lt':
        return Number(resolvedValue) < Number(compareValue);

      case 'gte':
        return Number(resolvedValue) >= Number(compareValue);

      case 'lte':
        return Number(resolvedValue) <= Number(compareValue);

      case 'contains':
        if (typeof resolvedValue === 'string' && typeof compareValue === 'string') {
          return resolvedValue.includes(compareValue);
        }
        if (Array.isArray(resolvedValue)) {
          return resolvedValue.includes(compareValue);
        }
        return false;

      default:
        console.warn(`[SDUI] Unknown condition operator: ${operator}`);
        return Boolean(resolvedValue);
    }
  } catch (error) {
    console.warn('[SDUI] Error evaluating condition:', error);
    return false;
  }
}

import { z } from 'zod';

export const SDUIActionSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    type: z.enum([
      'navigate',
      'goBack',
      'openUrl',
      'apiCall',
      'setState',
      'showToast',
      'showBottomSheet',
      'dismiss',
      'chain',
      'prefetch',
      'noop',
    ]),
    payload: z.record(z.string(), z.unknown()).optional(),
    steps: z.array(SDUIActionSchema).optional(),
    onSuccess: SDUIActionSchema.optional(),
    onError: SDUIActionSchema.optional(),
  })
);

export const SDUIConditionSchema = z.object({
  expression: z.string(),
  operator: z
    .enum(['eq', 'neq', 'gt', 'lt', 'gte', 'lte', 'contains', 'truthy', 'falsy'])
    .optional(),
  value: z.unknown().optional(),
});

export const SDUIListFilterSchema = z.object({
  field: z.string(),
  operator: z
    .enum(['eq', 'neq', 'gt', 'lt', 'gte', 'lte', 'contains', 'truthy', 'falsy', 'maxMinutes'])
    .optional(),
  value: z.unknown().optional(),
});

export const SDUIDataSourceSchema = z.object({
  type: z.enum(['remote', 'local', 'state']),
  url: z.string().optional(),
  method: z.enum(['GET', 'POST']).optional(),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.record(z.string(), z.unknown()).optional(),
  stateKey: z.string().optional(),
  data: z.array(z.unknown()).optional(),
  filters: z.record(z.string(), SDUIListFilterSchema).optional(),
});

// Lazy recursive type definition for SDUINode
export const SDUINodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string().optional(),
    type: z.string(),
    fallbackType: z.string().optional(),
    analytics: z
      .object({
        impressionEvent: z.string().optional(),
        clickEvent: z.string().optional(),
        properties: z.record(z.string(), z.unknown()).optional(),
      })
      .optional(),
    props: z.record(z.string(), z.unknown()).optional(),
    style: z.record(z.string(), z.unknown()).optional(),
    children: z.array(SDUINodeSchema).optional(),
    actions: z.record(z.string(), SDUIActionSchema).optional(),
    dataSource: SDUIDataSourceSchema.optional(),
    itemTemplate: SDUINodeSchema.optional(),
    condition: SDUIConditionSchema.optional(),
    ifTrue: SDUINodeSchema.optional(),
    ifFalse: SDUINodeSchema.optional(),
  })
);

export const SDUIScreenSchema = z.object({
  screenId: z.string(),
  version: z.number().default(1),
  metadata: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      analytics: z.record(z.string(), z.unknown()).optional(),
      cachePolicy: z.enum(['no-cache', 'cache-first', 'stale-while-revalidate']).optional(),
      cacheTTL: z.number().optional(),
      transition: z.enum(['slide', 'fade', 'modal', 'none']).optional(),
    })
    .default({}),
  root: SDUINodeSchema,
  overlay: z.array(SDUINodeSchema).optional(),
});

export function validateSDUIScreen(json: unknown) {
  return SDUIScreenSchema.safeParse(json);
}

export function validateSDUINode(json: unknown) {
  return SDUINodeSchema.safeParse(json);
}

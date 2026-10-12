const fs = require('fs');
const path = require('path');
const { z } = require('zod');

// Schema definitions matching SchemaValidator.ts
const SDUIActionSchema = z.lazy(() =>
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

const SDUIConditionSchema = z.object({
  expression: z.string(),
  operator: z
    .enum(['eq', 'neq', 'gt', 'lt', 'gte', 'lte', 'contains', 'truthy', 'falsy'])
    .optional(),
  value: z.unknown().optional(),
});

const SDUIDataSourceSchema = z.object({
  type: z.enum(['remote', 'local', 'state']),
  url: z.string().optional(),
  method: z.enum(['GET', 'POST']).optional(),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.record(z.string(), z.unknown()).optional(),
  stateKey: z.string().optional(),
  data: z.array(z.unknown()).optional(),
});

const SDUINodeSchema = z.lazy(() =>
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

const SDUIScreenSchema = z.object({
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
});

const schemasDir = path.join(__dirname, '..', 'src', 'schemas');
console.log('🔍 Validating SDUI JSON schemas in:', schemasDir);

let hasErrors = false;

if (!fs.existsSync(schemasDir)) {
  console.error('❌ Schemas directory not found!');
  process.exit(1);
}

const files = fs.readdirSync(schemasDir).filter((file) => file.endsWith('.json'));

for (const file of files) {
  const filePath = path.join(schemasDir, file);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(content);
    const result = SDUIScreenSchema.safeParse(json);

    if (result.success) {
      console.log(`✅ [VALID] ${file} (Screen ID: "${result.data.screenId}", v${result.data.version})`);
    } else {
      hasErrors = true;
      console.error(`❌ [INVALID] ${file}`);
      console.error(JSON.stringify(result.error.format(), null, 2));
    }
  } catch (err) {
    hasErrors = true;
    console.error(`❌ [PARSE ERROR] ${file}:`, err.message);
  }
}

if (hasErrors) {
  console.error('\n💥 CI Schema Validation Failed! Fix schema contract violations above.');
  process.exit(1);
} else {
  console.log('\n🎉 All SDUI Schemas are valid and adhere to production contract!');
  process.exit(0);
}

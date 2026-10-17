import { auditSchemaFixtures } from '../packages/sdui/src/sdui/contractAudit';

const gaps = auditSchemaFixtures();

if (gaps.length > 0) {
  console.error('SDUI contract coverage failed:');
  for (const gap of gaps) console.error(`- ${gap}`);
  process.exit(1);
}

console.log('SDUI contract coverage passed. Every component, action, and schema field has a fixture.');

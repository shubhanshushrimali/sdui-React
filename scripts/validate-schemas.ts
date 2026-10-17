import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSDUIScreen } from '../packages/sdui/src/sdui/SchemaValidator';

const schemasDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'schemas');

function listJson(dir: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listJson(full));
    else if (entry.name.endsWith('.json')) files.push(full);
  }
  return files;
}

console.log('Validating SDUI JSON schemas in:', schemasDir);

let hasErrors = false;
const files = listJson(schemasDir);

for (const filePath of files) {
  const label = path.relative(schemasDir, filePath);
  try {
    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const result = validateSDUIScreen(json);
    if (result.success) {
      console.log(`OK ${label} (${result.data.screenId} v${result.data.version})`);
    } else {
      hasErrors = true;
      console.error(`INVALID ${label}`);
      console.error(JSON.stringify(result.error.format(), null, 2));
    }
  } catch (error) {
    hasErrors = true;
    console.error(`PARSE ERROR ${label}:`, (error as Error).message);
  }
}

if (hasErrors) {
  console.error('Schema validation failed.');
  process.exit(1);
}

console.log('All SDUI schemas match the contract.');

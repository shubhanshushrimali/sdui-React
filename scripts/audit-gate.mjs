import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const allowlist = JSON.parse(readFileSync(path.join(root, 'scripts', 'audit-allowlist.json'), 'utf8'));
const allowed = new Map(allowlist.advisories.map((entry) => [entry.id, entry]));

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const result = spawnSync(npm, ['audit', '--omit=dev', '--json'], {
  cwd: root,
  encoding: 'utf8',
});

if (!result.stdout) {
  console.error(result.stderr || 'npm audit produced no report');
  process.exit(1);
}

const report = JSON.parse(result.stdout);
const seen = new Map();

for (const vuln of Object.values(report.vulnerabilities ?? {})) {
  for (const via of vuln.via ?? []) {
    if (!via || typeof via !== 'object' || !via.url) continue;
    const id = via.url.split('/').pop();
    if (!seen.has(id)) {
      seen.set(id, {
        id,
        package: via.name,
        severity: via.severity,
        title: via.title,
      });
    }
  }
}

const unexpected = [];
for (const advisory of seen.values()) {
  const reviewed = allowed.get(advisory.id);
  if (advisory.severity === 'critical' || !reviewed) unexpected.push(advisory);
}

if (allowed.size > 0) {
  console.log('Reviewed production advisories:');
  for (const entry of allowlist.advisories) {
    const present = seen.has(entry.id) ? 'still present' : 'gone';
    console.log(`- ${entry.id} (${entry.package}, ${present}): ${entry.reason}`);
  }
}

if (unexpected.length > 0) {
  console.error('\nUnreviewed production advisories:');
  for (const advisory of unexpected) {
    console.error(`- ${advisory.severity} ${advisory.id} in ${advisory.package}: ${advisory.title}`);
  }
  console.error('\nReview each advisory. Add it to scripts/audit-allowlist.json only when no compatible patch exists.');
  process.exit(1);
}

console.log(`\nAudit gate passed. ${seen.size} reviewed advisory id(s), no critical findings.`);

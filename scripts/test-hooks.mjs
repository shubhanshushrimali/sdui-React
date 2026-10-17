import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { transformSync } from 'esbuild';

const stubs = {
  'react-native': new URL('./test-stubs/react-native.mjs', import.meta.url).href,
  'expo-router': new URL('./test-stubs/expo-router.mjs', import.meta.url).href,
  '@react-native-async-storage/async-storage': new URL('./test-stubs/async-storage.mjs', import.meta.url).href,
  '@sdui/react': new URL('../packages/sdui/src/index.ts', import.meta.url).href,
};

const extensions = ['.ts', '.tsx', '.js', '.mjs', '.json'];

export async function resolve(specifier, context, nextResolve) {
  const stub = stubs[specifier];
  if (stub) return { url: stub, shortCircuit: true };

  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (error?.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith('.') || !context.parentURL) {
      throw error;
    }
    const base = new URL(specifier, context.parentURL);
    for (const ext of extensions) {
      const candidate = new URL(`${base.href}${ext}`);
      if (existsSync(fileURLToPath(candidate))) {
        return { url: candidate.href, shortCircuit: true };
      }
    }
    throw error;
  }
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.json')) {
    const source = readFileSync(fileURLToPath(url), 'utf8');
    return { format: 'module', source: `export default ${source}`, shortCircuit: true };
  }
  if (url.endsWith('.ts') || url.endsWith('.tsx')) {
    const source = readFileSync(fileURLToPath(url), 'utf8');
    const result = transformSync(source, {
      loader: url.endsWith('.tsx') ? 'tsx' : 'ts',
      format: 'esm',
      sourcefile: url,
      target: 'esnext',
    });
    return { format: 'module', source: result.code, shortCircuit: true };
  }
  return nextLoad(url, context);
}

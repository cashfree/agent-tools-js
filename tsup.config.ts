import {defineConfig, Options} from 'tsup';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(path.join(__dirname, 'package.json'), 'utf-8')
);

const commonConfig: Options = {
  outDir: '.',
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: false,
  splitting: false,
  treeshake: true,
  define: {
    __PACKAGE_VERSION__: JSON.stringify(pkg.version),
  },
  external: [
    'openai',
    '@openai/agents',
    'ai',
    '@ai-sdk/provider',
    '@langchain/core',
    'cashfree-pg',
    'zod',
    'zod-to-json-schema',
  ],
};

export default defineConfig([
  {
    ...commonConfig,
    entry: {'openai/index': 'src/openai/index.ts'},
  },
  {
    ...commonConfig,
    entry: {'ai-sdk/index': 'src/ai-sdk/index.ts'},
  },
  {
    ...commonConfig,
    entry: {'langchain/index': 'src/langchain/index.ts'},
  },
]);

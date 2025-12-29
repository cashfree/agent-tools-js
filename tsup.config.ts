import {defineConfig, Options} from 'tsup';

const commonConfig: Options = {
  outDir: '.',
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: false,
  splitting: false,
  treeshake: true,
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

import { plugins, VERSION } from './rollup.common.js';
import { terser } from 'rollup-plugin-terser';

export default env => {

  const fileName = (outputSuffix) => `split-browser${env.branch !== 'main' ? `-dev-${env.commit_hash}` : `-${VERSION}`}${outputSuffix ? `.${outputSuffix}` : ''}`;

  const createRollupConfig = (input, outputSuffix) => ({
    input,
    output: [
      // development build
      {
        format: 'umd', // works as `cjs`, `iife` and `amd` all in one
        name: 'splitio',
        file: `umd/${fileName(outputSuffix)}.js`
      },
      // production build
      {
        format: 'umd',
        name: 'splitio',
        file: `umd/${fileName(outputSuffix)}.min.js`,
        plugins: [
          terser()
        ]
      }
    ],
    plugins
  });

  return [
    createRollupConfig('src/umd.ts'), // umd/split-browser-VERSION[.min].js
    createRollupConfig('src/slim/umd.ts', 'slim') // umd/split-browser-VERSION.slim[.min].js
  ];
};

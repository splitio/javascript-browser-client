import { plugins, VERSION } from './rollup.common.js';
import { terser } from 'rollup-plugin-terser';

export default env => {

  const createRollupConfig = (input, outputSuffix) => ({
    input,
    output: [
      // development build
      {
        format: 'umd', // works as `cjs`, `iife` and `amd` all in one
        name: 'splitio',
        file: `umd/split-browser${outputSuffix ? `-${outputSuffix}` : ''}${env.branch !== 'main' ? `-dev-${env.commit_hash}` : `-${VERSION}`}.js`
      },
      // production build
      {
        format: 'umd',
        name: 'splitio',
        file: `umd/split-browser${outputSuffix ? `-${outputSuffix}` : ''}${env.branch !== 'main' ? `-dev-${env.commit_hash}` : `-${VERSION}`}.min.js`,
        plugins: [
          terser()
        ]
      }
    ],
    plugins
  });

  return [

    createRollupConfig('src/umd.ts', 'full'), // umd/split-browser-full[.min].js
    createRollupConfig('src/umdMinOnline.ts') // umd/split-browser[.min].js
  ];
};

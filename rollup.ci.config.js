import { plugins, VERSION } from './rollup.common.js';
import { terser } from 'rollup-plugin-terser';

export default env => {

  const fileName = (outputSuffix) => `split-browser${env.branch !== 'main' ? `-dev-${env.commit_hash || VERSION}` : `-${VERSION}`}${outputSuffix ? `.${outputSuffix}` : ''}`;

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
    /**
     * Using ES modules as input to avoid transpiling TS files, because it speeds up the build, but also because Rollup plugins like
     * https://www.npmjs.com/package/@rollup/plugin-typescript or https://www.npmjs.com/package/rollup-plugin-typescript2
     * don't compile .ts files in node_modules, like Webpack ts-loader does (https://github.com/TypeStrong/ts-loader#allowtsinnodemodules)
     *
     * Only https://www.npmjs.com/package/rollup-plugin-ts compiles from node_modules, and is used for tests.
     */
    createRollupConfig('esm/full/umd.js', 'full'), // umd/split-browser-VERSION.full[.min].js
    createRollupConfig('esm/umd.js') // umd/split-browser-VERSION[.min].js
  ];
};

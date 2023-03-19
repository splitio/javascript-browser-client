import { plugins, VERSION } from './rollup.common.js';
import terser from '@rollup/plugin-terser';
import visualizer from 'rollup-plugin-visualizer';

const createRollupConfig = (input, outputPrefix) => ({
  input,
  output: [{
    format: 'umd', // works as `cjs`, `iife` and `amd` all in one
    name: 'splitio',
    file: `umd/${outputPrefix}-${VERSION}.js`,
  }, {
    format: 'umd',
    name: 'splitio',
    file: `umd/${outputPrefix}-${VERSION}.min.js`,
    // Including sourcemap to use the rollup vizualizer over the minified bundle
    sourcemap: true,
    plugins: [
      terser(),
      visualizer({
        filename: `stats/rollup-tsc-${outputPrefix}-${VERSION}.min.html`,
        sourcemap: true
      })
    ]
  }],
  plugins
});

export default [
  createRollupConfig('esm/full/umd.js', 'split-full'),
  createRollupConfig('esm/umd.js', 'split-slim'),
];

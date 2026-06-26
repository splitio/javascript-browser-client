const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const { string } = require('rollup-plugin-string');
const terser = require('@rollup/plugin-terser');
const nodePolyfills = require('rollup-plugin-polyfill-node');
const ts = require('rollup-plugin-ts');

module.exports = (input, output) => ({
  input,
  output: {
    file: output,
    format: 'iife',
    name: 'splitioTests',
    inlineDynamicImports: true
  },
  plugins: [
    nodeResolve({
      extensions: ['.mjs', '.js', '.json', '.node', '.ts'],
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    json(),
    string({ include: '**/*.txt' }),
    ts({ tsconfig: './tsconfig.json', transpileOnly: true }),
    terser(),
    nodePolyfills()
  ]
});

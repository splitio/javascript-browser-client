import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

const plugins = [
  resolve(), // uses `module` as `mainFields` by default
  commonjs(),
  terser()
];

export default [{
  input: './testESM.js',
  output: {
    file: './bundleESM.js',
    format: 'cjs'
  },
  plugins
}, {
  input: './testESM_TreeShaking.js',
  output: {
    file: './bundleESM_TreeShaking.js',
    format: 'cjs'
  },
  plugins
}];

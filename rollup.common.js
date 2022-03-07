import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json';

export const VERSION = pkg.version;

export const plugins = [
  nodeResolve({
    // defaults `extensions` plus '.ts' files
    extensions: [
      '.mjs', '.js', '.json', '.node'
    ],
    browser: true,
    preferBuiltins: false,
  }),
  commonjs()
];

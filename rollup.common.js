import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'typescript';
import ts from 'rollup-plugin-ts';
import pkg from './package.json';

export const VERSION = pkg.version;

export const plugins = [
  nodeResolve({
    // defaults `extensions` plus '.ts' files
    extensions: [
      '.mjs', '.js', '.json', '.node', '.ts'
    ],
    browser: true,
    preferBuiltins: false,
  }),
  commonjs(),
  ts({
    typescript,
    tsconfig: './tsconfig.json',
    browserlist: false // using target property of tsconfig file
  })
];

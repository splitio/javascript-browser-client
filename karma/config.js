'use strict';

// Comment the next two lines if you want to run with Chrome instead of Chromium
// const puppeteer = require('puppeteer');
// process.env.CHROME_BIN = puppeteer.executablePath();

const nodeResolve = require('@rollup/plugin-node-resolve').nodeResolve;
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const string = require('rollup-plugin-string').string;
const typescript = require('typescript');
const ts = require('@wessberg/rollup-plugin-ts');
const terser = require('rollup-plugin-terser').terser;
const nodePolyfills = require('rollup-plugin-node-polyfills');

module.exports = {
  // base path, that will be used to resolve files and exclude
  basePath: '../src',

  // load tap integration
  frameworks: [
    'tap'
  ],

  // Run on Chrome Headless. Use 'Chrome' instead to run on full browser
  browsers: [
    'ChromeHeadless'
  ],

  rollupPreprocessor: {
    // `input` is handled by karma-rollup-preprocessor.
    output: {
      format: 'umd',
      name: 'splitio',
      // sourcemap: 'inline', // Uncomment for debugging
    },
    plugins: [
      nodeResolve({
        extensions: ['.mjs', '.js', '.json', '.node', '.ts'], // defaults `extensions` plus '.ts' files
        browser: true,
        preferBuiltins: false,
      }),
      commonjs(),
      json(),
      string({ include: '**/*.txt' }),
      ts({
        typescript,
        tsconfig: './tsconfig.json',
        browserlist: false
      }),
      terser(),
      nodePolyfills()
    ]
  },

  // web server port
  port: 9876,

  // make IE happy (in theory not required)
  // https://msdn.microsoft.com/en-us/library/ff955275(v=vs.85).aspx
  customHeaders: [{
    match: 'html',
    name: 'X-UA-Compatible',
    value: 'IE=edge'
  }, {
    match: 'csv$',
    name: 'Content-Type',
    value: 'text/plain'
  }],

  // Which plugins to enable
  plugins: [
    'karma-*'
  ],

  browserConsoleLogOptions: {
    terminal: false // browser console logs are not written in the terminal
  },

  // Continuous Integration mode
  // if true, it capture browsers, run tests and exit
  singleRun: true,

  colors: true,

  // Number of tries a browser will attempt in the case of a disconnection
  browserDisconnectTolerance: 1,
  // How long will Karma wait for a message from a browser before disconnecting from it (in ms)
  browserNoActivityTimeout: 60 * 60 * 1000,
  // Report tests that are slower than 30 ms
  reportSlowerThan: 30,
};

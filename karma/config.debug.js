'use strict';

const merge = require('lodash/merge');

module.exports = merge({}, require('./config'), {
  customLaunchers: {
    ChromeNoSandbox: {
      base: 'Chrome',
      flags: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    }
  },
  browsers: [
    'ChromeNoSandbox'
  ],
  rollupPreprocessor: {
    output: {
      file: 'karma/bundle.js',
      sourcemap: 'inline',
    },
  },
  singleRun: false
});

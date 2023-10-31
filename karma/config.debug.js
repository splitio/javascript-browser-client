'use strict';

const merge = require('lodash/merge');

module.exports = merge({}, require('./config'), {
  browsers: [
    'Chrome'
  ],
  rollupPreprocessor: {
    output: {
      file: 'karma/bundle.js',
      sourcemap: 'inline',
    },
  },
  singleRun: false
});

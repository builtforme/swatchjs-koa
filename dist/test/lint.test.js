'use strict';

var lint = require('mocha-eslint');

// Explicit test to run linter as part of test suite
var paths = ['index.js', 'lib', 'test'];

var options = {
  strict: true // Fail test suite on any warnings or errors
};

lint(paths, options);
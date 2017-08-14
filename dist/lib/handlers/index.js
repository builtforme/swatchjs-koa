'use strict';

var get = require('./get');
var post = require('./post');

var HANDLERS = {
  get: get,
  post: post
};

module.exports = HANDLERS;
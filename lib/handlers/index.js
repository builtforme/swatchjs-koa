'use strict';

const get = require('./get');
const post = require('./post');

const HANDLERS = {
  get,
  post,
};

module.exports = HANDLERS;

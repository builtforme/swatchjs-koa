'use strict';

var handler = require('./handler');

function get(method) {
  return getHandler;

  function getHandler(koaCtx, next) {
    return handler(koaCtx, koaCtx.query, method);
  }
}

module.exports = get;
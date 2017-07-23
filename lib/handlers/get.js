'use strict';

const handler = require('./handler');

function get(swatchCtx, method) {
  return getHandler;

  function getHandler(koaCtx, next) {
    return handler(swatchCtx, koaCtx, koaCtx.query, method);
  }
}

module.exports = get;

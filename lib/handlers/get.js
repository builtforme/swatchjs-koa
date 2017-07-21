'use strict';

const handler = require('./handler');

function get(swatchCtx, method) {
  return getHandler;

  function getHandler(ctx, next) {
    return handler(ctx, ctx.query, method);
  }
}

module.exports = get;

'use strict';

const handler = require('./handler');

function get(info) {
  return getHandler;

  function getHandler(ctx, next) {
    handler(ctx, ctx.query, info);
  }
}

module.exports = get;

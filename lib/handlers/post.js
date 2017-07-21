'use strict';

const handler = require('./handler');

function post(swatchCtx, method) {
  return postHandler;

  function postHandler(ctx, next) {
    return handler(ctx, ctx.request.body, method);
  }
}

module.exports = post;

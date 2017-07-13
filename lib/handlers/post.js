'use strict';

const handler = require('./handler');

function post(info) {
  return postHandler;

  function postHandler(ctx, next) {
    return handler(ctx, ctx.body, info);
  }
}

module.exports = post;

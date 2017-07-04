'use strict';

const handler = require('./handler');

function post(info) {
  return postHandler;

  function postHandler(req, res, next) {
    handler(ctx, ctx.body, info);
  }
}

module.exports = post;

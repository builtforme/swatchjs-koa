const handler = require('./handler');

function get(method) {
  function getHandler(koaCtx) {
    return handler(koaCtx, koaCtx.query, method);
  }

  return getHandler;
}

module.exports = get;

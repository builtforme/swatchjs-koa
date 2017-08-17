function post(koaCtx) {
  return koaCtx.request.body;
}

module.exports = post;

const Router = require('koa-router');
const swatchjsKoa = require('swatchjs-koa-middleware');

const defaults = require('./defaults');
const handler = require('./handler');
const middleware = require('./middleware');
const validation = require('./validation');

function expose(app, methods, opts) {
  const options = defaults(opts);

  const router = new Router();

  function addMethod(method) {
    function addRoute(supportedVerb) {
      const verb = supportedVerb.trim();
      const path = `${options.prefix}${method.name}`;
      const paramFn = swatchjsKoa.methods[verb];

      const noAuth = method.metadata.noAuth;
      const methodMiddleware = method.metadata.middleware;

      const adapterMiddleware = noAuth ? [] : [options.authAdapter];

      const swatchMiddleware = [
        middleware.swatchCtx(options),
        swatchjsKoa.logger.init,
      ];
      const adapter = swatchMiddleware.concat(adapterMiddleware);
      const validator = adapter.concat(
        [validation.wrapMiddleware(method.validate, paramFn)],
      );
      const middlewareArray = validator.concat(
        methodMiddleware.map(middleware.wrapMiddleware),
      );

      const methodHandler = options.rawResponse ?
        handler.raw(method.handle) :
        handler.wrapped(method.handle);
      const handlerList = middlewareArray.concat([methodHandler]);

      router[verb](path, ...handlerList);
    }

    options.verbs.forEach(addRoute);
  }

  methods.forEach(addMethod);

  app.use(router.routes());
}

module.exports = expose;

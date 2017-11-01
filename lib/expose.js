const Router = require('koa-router');
const middleware = require('swatchjs-koa-middleware');

const context = require('./context');
const defaults = require('./defaults');
const handler = require('./handler');
const validation = require('./validation');
const wrapper = require('./wrapper');

function expose(app, methods, opts) {
  const options = defaults(opts);

  const router = new Router();

  function addMethod(method) {
    function addRoute(supportedVerb) {
      const verb = supportedVerb.trim();
      const path = `${options.prefix}${method.name}`;
      const paramFn = middleware.methods[verb];

      const noAuth = method.metadata.noAuth;
      const methodMiddleware = method.metadata.middleware;

      const adapterMiddleware = noAuth ? [] : [options.authAdapter];
      const validateMiddleware = validation.middleware(method.validate, paramFn);

      const swatchMiddleware = [
        context.init(options),
        middleware.logger.init,
      ];
      const adapter = swatchMiddleware.concat(adapterMiddleware);
      const validator = adapter.concat(
        [wrapper.wrap(validateMiddleware)],
      );
      const middlewareArray = validator.concat(
        methodMiddleware.map(wrapper.wrap),
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

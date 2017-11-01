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
      const methodHandler = options.rawResponse ?
        handler.raw(method.handle) :
        handler.wrapped(method.handle);

      const contextMiddleware = context.init(options);
      const loggerMiddleware = middleware.logger.init;
      const adapterMiddleware = noAuth ? [] : [options.authAdapter];
      const methodMiddleware = method.metadata.middleware;
      const validateMiddleware = validation.middleware(method.validate, paramFn);

      const loggerM = [contextMiddleware, loggerMiddleware];
      const adapterM = loggerM.concat(adapterMiddleware);
      const validatorM = adapterM.concat(
        [wrapper.wrap(validateMiddleware)],
      );
      const methodM = validatorM.concat(
        methodMiddleware.map(wrapper.wrap),
      );
      const allMiddleware = methodM.concat([methodHandler]);

      router[verb](path, ...allMiddleware);
    }

    options.verbs.forEach(addRoute);
  }

  methods.forEach(addMethod);

  app.use(router.routes());
}

module.exports = expose;

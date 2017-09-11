const Router = require('koa-router');

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

      const noAuth = method.metadata.noAuth;
      const methodMiddleware = method.metadata.middleware;

      const adapter = noAuth ?
        [middleware.swatchCtx(options)] :
        [middleware.swatchCtx(options), options.authAdapter];
      const validator = adapter.concat(
        [validation.wrapMiddleware(method.validate, verb)],
      );
      const middlewareArray = validator.concat(
        methodMiddleware.map(middleware.wrapMiddleware),
      );

      const methodHandler = handler.create(method.handle);
      const handlerList = middlewareArray.concat([methodHandler]);

      router[verb](path, ...handlerList);
    }

    options.verbs.forEach(addRoute);
  }

  methods.forEach(addMethod);

  app.use(router.routes());
}

module.exports = expose;

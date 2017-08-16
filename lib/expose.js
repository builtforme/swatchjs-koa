const Router = require('koa-router');

const defaults = require('./defaults');
const handlers = require('./handlers');
const response = require('./response');

async function initSwatchCtx(koaCtx, next) {
  // Create the swatchCtx object on the KOA ctx
  koaCtx.swatchCtx = {};

  // Continue chain of handlers
  await next();
}

function wrapMiddleware(fn) {
  async function wrapper(koaCtx, next) {
    try {
      await fn(koaCtx, next);
    } catch (error) {
      // Auth error should trigger failure response
      response.errorResponse(koaCtx, error);
    }
  }

  return wrapper;
}

function expose(app, methods, opts) {
  const options = defaults(opts);

  const router = new Router();

  function addMethod(method) {
    function addRoute(supportedVerb) {
      const verb = supportedVerb.trim();
      const path = `${options.prefix}${method.name}`;

      const noAuth = method.metadata.noAuth || false;
      const methodMiddleware = method.metadata.middleware || [];

      const adapter = noAuth ?
        [initSwatchCtx] :
        [initSwatchCtx, options.authAdapter];
      const middleware = adapter.concat(
        methodMiddleware.map(wrapMiddleware),
      );

      const handler = handlers[verb](method);
      const handlerList = middleware.concat([handler]);

      router[verb](path, ...handlerList);
    }

    options.verbs.forEach(addRoute);
  }

  methods.forEach(addMethod);

  app.use(router.routes());
}

module.exports = expose;

import bunyan from 'bunyan';

const response = require('./response');

function swatchCtx(options) {
  async function swatchCtxMiddleware(koaCtx, next) {
    // Create the swatchCtx object on the KOA ctx
    koaCtx.swatchCtx = {};
    koaCtx.swatchCtx.request = {
      onException: options.onException,
    };

    // Continue chain of handlers
    await next();
  }

  return swatchCtxMiddleware;
}

function ensureLogger(logger) {
  // Check for a logger created by the client
  if (logger) { return logger; }

  // Otherwise create a default swatch-koa logger
  return bunyan.createLogger({
    name: 'swatch-koa',
  });
}

async function initLogger(koaCtx, next) {
  // Check the koaCtx for a koa-bunyan-logger and set on swatchCtx
  koaCtx.swatchCtx.logger = ensureLogger(koaCtx.log);

  // Continue chain of handlers
  await next();
}

function wrapMiddleware(fn) {
  async function middlewareWrapper(koaCtx, next) {
    try {
      await fn(koaCtx, next);
    } catch (error) {
      // Auth error should trigger failure response
      response.errorResponse(koaCtx, error);
    }
  }

  return middlewareWrapper;
}


module.exports = {
  initLogger,
  swatchCtx,
  wrapMiddleware,
};

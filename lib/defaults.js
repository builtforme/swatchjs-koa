'use strict';

const handlers = require('./handlers');
const response = require('./response');

const SUPPORTED_VERBS = Object.keys(handlers);

function defaults(options) {
  return {
    verbs: defaultVerbs(options && options.verbs),
    prefix: defaultPrefix(options && options.prefix),
    authAdapter: defaultAuthAdapter(options && options.authAdapter),
  };
}

function defaultVerbs(requested) {
  if (requested && !(requested instanceof Array)) {
    throw TypeError('requested HTTP verbs must be an array');
  }

  // requested verbs must be supported
  requested && requested.forEach(verb => {
    if (!(verb in handlers)) {
      throw `requested verb '${verb}' is not supported`;
    }
  });

  return requested || SUPPORTED_VERBS;
}

function defaultPrefix(prefix) {
  return (prefix && `/${prefix}/`) || '/';
}

function defaultAuthAdapter(authAdapter) {
  if (authAdapter && !(typeof authAdapter === 'function')) {
    throw TypeError('function required for authAdapter');
  }

  const authAdapterFn = authAdapter || noopAuthAdapter;

  return authMiddleware;

  function noopAuthAdapter() {
    return {};
  }

  async function authMiddleware(koaCtx, next) {
    try {
      const auth = await authAdapterFn(koaCtx);
      koaCtx.swatchCtx.auth = auth;

      await next();
    } catch (error) {
      // Auth error should trigger failure response
      response.errorResponse(koaCtx, error);
    }
  };
}

module.exports = defaults;

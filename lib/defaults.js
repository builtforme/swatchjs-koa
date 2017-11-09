const middleware = require('swatchjs-koa-middleware');

const response = require('./response');

const SUPPORTED_VERBS = ['get', 'post'];
const methods = middleware.methods;

function defaultVerbs(requested) {
  if (requested && !(requested instanceof Array)) {
    throw TypeError('requested HTTP verbs must be an array');
  }

  // requested verbs must be supported
  if (requested) {
    requested.forEach((verb) => {
      if (!(verb in methods)) {
        throw new Error(`requested verb '${verb}' is not supported`);
      }
    });
  }

  return requested || SUPPORTED_VERBS;
}

function defaultPrefix(prefix) {
  return (prefix && `/${prefix}/`) || '/';
}

function defaultAuthAdapter(options) {
  const authAdapter = options && options.authAdapter;

  if (authAdapter !== undefined) {
    if (!(typeof authAdapter === 'function')) {
      throw TypeError('function required for authAdapter');
    }
  }

  // Return an empty object by default
  function noopAuthAdapter() {
    return {};
  }

  const authAdapterFn = authAdapter || noopAuthAdapter;

  async function authMiddleware(koaCtx, next) {
    try {
      const auth = await authAdapterFn(koaCtx);
      koaCtx.swatchCtx.auth = auth;

      await next();
    } catch (error) {
      // Auth error should trigger failure response
      response.errorResponse(options)(koaCtx, error);
    }
  }

  return authMiddleware;
}

function defaultOnException(onException) {
  if (onException !== undefined) {
    if (!(typeof onException === 'function')) {
      throw TypeError('function required for onException');
    }
  }

  // Rethrow the existing error by default
  function noopOnException(error) {
    throw error;
  }

  return onException || noopOnException;
}

function defaultRawResponse(rawResponse) {
  if (rawResponse === undefined) {
    return false;
  }
  return Boolean(rawResponse);
}

function defaultRequestIdProp(requestIdProp) {
  if (requestIdProp === undefined || requestIdProp === null) {
    return undefined;
  }
  if (typeof requestIdProp !== 'string') {
    return undefined;
  }
  if (requestIdProp === '') {
    return undefined;
  }
  return requestIdProp;
}

function defaults(options) {
  return {
    authAdapter: defaultAuthAdapter(options),
    verbs: defaultVerbs(options && options.verbs),
    prefix: defaultPrefix(options && options.prefix),
    onException: defaultOnException(options && options.onException),
    rawResponse: defaultRawResponse(options && options.rawResponse),
    requestIdProp: defaultRequestIdProp(options && options.requestIdProp),
  };
}

module.exports = defaults;

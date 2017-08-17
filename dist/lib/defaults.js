'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var handlers = require('./handlers');
var response = require('./response');

var SUPPORTED_VERBS = ['get', 'post'];

function defaultVerbs(requested) {
  if (requested && !(requested instanceof Array)) {
    throw TypeError('requested HTTP verbs must be an array');
  }

  // requested verbs must be supported
  if (requested) {
    requested.forEach(function (verb) {
      if (!(verb in handlers)) {
        throw new Error('requested verb \'' + verb + '\' is not supported');
      }
    });
  }

  return requested || SUPPORTED_VERBS;
}

function defaultPrefix(prefix) {
  return prefix && '/' + prefix + '/' || '/';
}

function defaultAuthAdapter(authAdapter) {
  var authMiddleware = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(koaCtx, next) {
      var auth;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return authAdapterFn(koaCtx);

            case 3:
              auth = _context.sent;

              koaCtx.swatchCtx.auth = auth;

              _context.next = 7;
              return next();

            case 7:
              _context.next = 12;
              break;

            case 9:
              _context.prev = 9;
              _context.t0 = _context['catch'](0);

              // Auth error should trigger failure response
              response.errorResponse(koaCtx, _context.t0);

            case 12:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this, [[0, 9]]);
    }));

    return function authMiddleware(_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();

  if (authAdapter && !(typeof authAdapter === 'function')) {
    throw TypeError('function required for authAdapter');
  }

  function noopAuthAdapter() {
    return {};
  }

  var authAdapterFn = authAdapter || noopAuthAdapter;

  return authMiddleware;
}

function defaults(options) {
  return {
    verbs: defaultVerbs(options && options.verbs),
    prefix: defaultPrefix(options && options.prefix),
    authAdapter: defaultAuthAdapter(options && options.authAdapter)
  };
}

module.exports = defaults;
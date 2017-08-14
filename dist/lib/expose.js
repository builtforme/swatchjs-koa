'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var initSwatchCtx = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(koaCtx, next) {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // Create the swatchCtx object on the KOA ctx
            koaCtx.swatchCtx = {};

            // Continue chain of handlers
            _context.next = 3;
            return next();

          case 3:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function initSwatchCtx(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Router = require('koa-router');

var defaults = require('./defaults');
var handlers = require('./handlers');
var response = require('./response');

function expose(app, methods, options) {
  options = defaults(options);

  var router = new Router();

  methods.forEach(addMethod);

  function addMethod(method) {
    options.verbs.forEach(addRoute);

    function addRoute(verb) {
      verb = verb.trim();

      var path = '' + options.prefix + method.name;

      var adapter = method.noAuth ? [initSwatchCtx] : [initSwatchCtx, options.authAdapter];
      var middleware = adapter.concat(method.middleware.map(function (fn) {
        return wrapMiddleware(fn);
      }));

      var handler = handlers[verb](method);
      var handlerList = middleware.concat([handler]);

      router[verb].apply(router, [path].concat((0, _toConsumableArray3.default)(handlerList)));
    }
  }

  app.use(router.routes());
}

;

function wrapMiddleware(fn) {
  var wrapper = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(koaCtx, next) {
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              _context2.next = 3;
              return fn(koaCtx, next);

            case 3:
              _context2.next = 8;
              break;

            case 5:
              _context2.prev = 5;
              _context2.t0 = _context2['catch'](0);

              // Auth error should trigger failure response
              response.errorResponse(koaCtx, _context2.t0);

            case 8:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this, [[0, 5]]);
    }));

    return function wrapper(_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  }();

  return wrapper;
}

module.exports = expose;
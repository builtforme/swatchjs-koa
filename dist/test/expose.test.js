'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Koa = require('koa');

var chai = require('chai');
var http = require('http');
var swatch = require('swatchjs');
var request = require('supertest');

var expose = require('../lib/expose');

var expect = chai.expect;

function getModel() {
  var model = swatch({
    add: {
      handler: function handler(a, b) {
        return a + b;
      }
    },
    sub: {
      handler: function handler(a, b) {
        return a - b;
      }
    }
  });

  return model;
}

describe('expose', function () {
  it('should only register the requested verbs', function () {
    var app = new Koa();
    var model = getModel();
    var options = {
      verbs: ['get']
    };

    expose(app, model, options);

    var router = app.middleware[0].router;
    expect(router.match('/add', 'GET').route).to.equal(true);
    expect(router.match('/sub', 'GET').route).to.equal(true);
  });

  it('should register all verbs if no verbs were specified', function () {
    var app = new Koa();
    var model = getModel();

    expose(app, model);

    var router = app.middleware[0].router;

    ['get', 'post'].forEach(function (verb) {
      expect(router.match('/add', verb.toUpperCase()).route).to.equal(true);
      expect(router.match('/sub', verb.toUpperCase()).route).to.equal(true);
    });
  });

  it('should use the specified prefix', function () {
    var app = new Koa();
    var model = getModel();

    var prefix = 'api';
    var options = {
      prefix: prefix
    };

    expose(app, model, options);

    var router = app.middleware[0].router;

    ['get', 'post'].forEach(function (verb) {
      expect(router.match('/' + prefix + '/add', verb.toUpperCase()).route).to.equal(true);
      expect(router.match('/' + prefix + '/sub', verb.toUpperCase()).route).to.equal(true);
    });
  });

  it('should support an auth adapter with middleware', function (done) {
    // Define an authAdapter that returns a simple auth object
    //  Define one middleware fn to copy auth info to response body
    var app = new Koa();
    var model = swatch({
      add: {
        handler: function handler() {
          return 10;
        },
        metadata: {
          middleware: [function (ctx) {
            ctx.body = {
              id: ctx.swatchCtx.auth.id,
              auth: ctx.swatchCtx.auth.auth
            };
          }]
        }
      }
    });
    var options = {
      authAdapter: function authAdapter() {
        return {
          id: 12345,
          auth: true
        };
      }
    };

    expose(app, model, options);

    request(http.createServer(app.callback())).get('/add').expect(200).end(function (err, res) {
      expect(err).to.equal(null);
      expect(res.body.id).to.equal(12345);
      expect(res.body.auth).to.equal(true);
      done();
    });
  });

  it('should skip auth adapter based on noAuth flag', function (done) {
    // Define an authAdapter that returns a simple auth object
    //  Configure the method to skip auth step and allow handler
    //  Define one middleware fn that checks if auth handler ran
    var app = new Koa();
    var model = swatch({
      add: {
        handler: function handler() {
          return 10;
        },
        metadata: {
          noAuth: true,
          middleware: [function (ctx) {
            ctx.body = {
              exists: Boolean(ctx.swatchCtx.auth)
            };
          }]
        }
      }
    });
    var options = {
      authAdapter: function authAdapter() {
        return {
          id: 12345,
          auth: true
        };
      }
    };

    expose(app, model, options);

    request(http.createServer(app.callback())).get('/add').expect(200).end(function (err, res) {
      expect(err).to.equal(null);
      expect(res.body.exists).to.equal(false);
      done();
    });
  });

  it('should support an async auth adapter with middleware', function (done) {
    // Define an authAdapter that returns a simple auth object
    //  Define one middleware fn to copy auth info to response body
    var app = new Koa();
    var model = swatch({
      add: {
        handler: function handler() {
          return 10;
        },
        metadata: {
          middleware: [function (ctx) {
            ctx.body = {
              id: ctx.swatchCtx.auth.id,
              auth: ctx.swatchCtx.auth.auth
            };
          }]
        }
      }
    });
    var options = {
      authAdapter: function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
          return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  return _context.abrupt('return', _promise2.default.resolve({
                    id: 12345,
                    auth: true
                  }));

                case 1:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, undefined);
        }));

        return function authAdapter() {
          return _ref.apply(this, arguments);
        };
      }()
    };

    expose(app, model, options);

    request(http.createServer(app.callback())).get('/add').expect(200).end(function (err, res) {
      expect(err).to.equal(null);
      expect(res.body.id).to.equal(12345);
      expect(res.body.auth).to.equal(true);
      done();
    });
  });

  it('should return an error when handler throws an error', function (done) {
    // Define a sync handler that throws an exception
    var app = new Koa();
    var model = swatch({
      add: {
        handler: function handler() {
          throw new Error('sync_whoops');
        }
      }
    });

    expose(app, model);

    request(http.createServer(app.callback())).get('/add').expect(200).end(function (err, res) {
      expect(err).to.equal(null);
      expect(res.body.ok).to.equal(false);
      expect(res.body.error).to.equal('sync_whoops');
      done();
    });
  });

  it('should return success from an async handler', function (done) {
    var app = new Koa();
    var model = swatch({
      add: {
        handler: function () {
          var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
            return _regenerator2.default.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    return _context2.abrupt('return', new _promise2.default(function (resolve) {
                      setTimeout(function () {
                        resolve(100);
                      }, 150);
                    }));

                  case 1:
                  case 'end':
                    return _context2.stop();
                }
              }
            }, _callee2, undefined);
          }));

          return function handler() {
            return _ref2.apply(this, arguments);
          };
        }()
      }
    });

    expose(app, model);

    request(http.createServer(app.callback())).get('/add').expect(200).end(function (err, res) {
      expect(err).to.equal(null);
      expect(res.body.ok).to.equal(true);
      expect(res.body.result).to.equal(100);
      done();
    });
  });

  it('should return an error when handler throws an error inside a promise', function (done) {
    // Define an async function that throws a exception from inside a promise
    var app = new Koa();
    var model = swatch({
      add: {
        handler: function () {
          var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
            return _regenerator2.default.wrap(function _callee3$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    return _context3.abrupt('return', _promise2.default.resolve('async_whoops').then(function (msg) {
                      throw msg;
                    }));

                  case 1:
                  case 'end':
                    return _context3.stop();
                }
              }
            }, _callee3, undefined);
          }));

          return function handler() {
            return _ref3.apply(this, arguments);
          };
        }()
      }
    });

    expose(app, model);

    request(http.createServer(app.callback())).get('/add').expect(200).end(function (err, res) {
      expect(err).to.equal(null);
      expect(res.body.ok).to.equal(false);
      expect(res.body.error).to.equal('async_whoops');
      done();
    });
  });

  it('should return an error when auth adapter throws an error', function (done) {
    // Define an authAdapter that throws an exception
    //  Define one middleware fn that should not run
    var app = new Koa();
    var model = swatch({
      add: {
        handler: function handler() {
          return 10;
        },
        metadata: {
          middleware: [function (ctx) {
            ctx.body = {
              id: ctx.swatchCtx.auth.id,
              auth: ctx.swatchCtx.auth.auth
            };
          }]
        }
      }
    });
    var options = {
      authAdapter: function authAdapter() {
        throw new Error('invalid_auth_whoops');
      }
    };

    expose(app, model, options);

    request(http.createServer(app.callback())).get('/add').expect(200).end(function (err, res) {
      expect(err).to.equal(null);
      expect(res.body.ok).to.equal(false);
      expect(res.body.error).to.equal('invalid_auth_whoops');
      done();
    });
  });

  it('should return an error when validation throws an error', function (done) {
    // Define an authAdapter that works correctly
    //  Define validation that throws an error
    var app = new Koa();
    var model = swatch({
      add: {
        handler: function handler(x) {
          return x + 10;
        },
        args: [{
          name: 'x',
          validate: function validate(x) {
            if (x < 10) {
              throw new Error('value_too_small');
            }
          }
        }]
      }
    });
    var options = {
      authAdapter: function authAdapter() {
        return {
          id: 12345
        };
      }
    };

    expose(app, model, options);

    request(http.createServer(app.callback())).get('/add?x=1').expect(200).end(function (err, res) {
      expect(err).to.equal(null);
      expect(res.body.ok).to.equal(false);
      expect(res.body.error).to.equal('value_too_small');
      done();
    });
  });

  it('should return an error when any middleware throws an error', function (done) {
    // Define an authAdapter that works correctly
    //  Define one middleware fn that throws an error
    var app = new Koa();
    var model = swatch({
      add: {
        handler: function handler() {
          return 10;
        },
        metadata: {
          middleware: [function () {
            throw new Error('invalid_middleware_oops');
          }]
        }
      }
    });
    var options = {
      authAdapter: function authAdapter() {
        return {
          id: 12345,
          auth: true
        };
      }
    };

    expose(app, model, options);

    request(http.createServer(app.callback())).get('/add').expect(200).end(function (err, res) {
      expect(err).to.equal(null);
      expect(res.body.ok).to.equal(false);
      expect(res.body.error).to.equal('invalid_middleware_oops');
      done();
    });
  });

  it('should allow sync middleware before running sync handler', function (done) {
    var app = new Koa();
    var model = swatch({
      add: {
        handler: function handler() {
          return 500;
        },
        metadata: {
          middleware: [function (ctx, next) {
            ctx.swatchCtx.value = 2000;
            next();
          }]
        }
      }
    });

    expose(app, model);

    request(http.createServer(app.callback())).get('/add').expect(200).end(function (err, res) {
      expect(err).to.equal(null);
      expect(res.body.ok).to.equal(true);
      expect(res.body.result).to.equal(500);
      done();
    });
  });

  it('should allow sync middleware before running async handler', function (done) {
    var app = new Koa();
    var model = swatch({
      add: {
        handler: function () {
          var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
            return _regenerator2.default.wrap(function _callee4$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    return _context4.abrupt('return', new _promise2.default(function (resolve) {
                      setTimeout(function () {
                        resolve(250);
                      }, 100);
                    }).then(function (val) {
                      return val * 5;
                    }));

                  case 1:
                  case 'end':
                    return _context4.stop();
                }
              }
            }, _callee4, undefined);
          }));

          return function handler() {
            return _ref4.apply(this, arguments);
          };
        }(),
        metadata: {
          middleware: [function () {
            var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(ctx, next) {
              return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                  switch (_context5.prev = _context5.next) {
                    case 0:
                      ctx.swatchCtx.value = 3000;
                      _context5.next = 3;
                      return next();

                    case 3:
                    case 'end':
                      return _context5.stop();
                  }
                }
              }, _callee5, undefined);
            }));

            return function (_x, _x2) {
              return _ref5.apply(this, arguments);
            };
          }()]
        }
      }
    });

    expose(app, model);

    request(http.createServer(app.callback())).get('/add').expect(200).end(function (err, res) {
      expect(err).to.equal(null);
      expect(res.body.ok).to.equal(true);
      expect(res.body.result).to.equal(1250);
      done();
    });
  });

  it('should allow async middleware before running sync handler', function (done) {
    var app = new Koa();
    var model = swatch({
      add: {
        handler: function handler() {
          return 1000;
        },
        metadata: {
          middleware: [function () {
            var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(ctx, next) {
              var result;
              return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                  switch (_context6.prev = _context6.next) {
                    case 0:
                      _context6.next = 2;
                      return _promise2.default.resolve(2000);

                    case 2:
                      result = _context6.sent;

                      ctx.swatchCtx.value = result;

                      _context6.next = 6;
                      return next();

                    case 6:
                    case 'end':
                      return _context6.stop();
                  }
                }
              }, _callee6, undefined);
            }));

            return function (_x3, _x4) {
              return _ref6.apply(this, arguments);
            };
          }()]
        }
      }
    });

    expose(app, model);

    request(http.createServer(app.callback())).get('/add').expect(200).end(function (err, res) {
      expect(err).to.equal(null);
      expect(res.body.ok).to.equal(true);
      expect(res.body.result).to.equal(1000);
      done();
    });
  });

  it('should allow async middleware before running async handler', function (done) {
    var app = new Koa();
    var model = swatch({
      add: {
        handler: function () {
          var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
            return _regenerator2.default.wrap(function _callee7$(_context7) {
              while (1) {
                switch (_context7.prev = _context7.next) {
                  case 0:
                    return _context7.abrupt('return', new _promise2.default(function (resolve) {
                      setTimeout(function () {
                        resolve(1000);
                      }, 100);
                    }).then(function (val) {
                      return val * 2;
                    }));

                  case 1:
                  case 'end':
                    return _context7.stop();
                }
              }
            }, _callee7, undefined);
          }));

          return function handler() {
            return _ref7.apply(this, arguments);
          };
        }(),
        metadata: {
          middleware: [function () {
            var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(ctx, next) {
              var result;
              return _regenerator2.default.wrap(function _callee8$(_context8) {
                while (1) {
                  switch (_context8.prev = _context8.next) {
                    case 0:
                      _context8.next = 2;
                      return _promise2.default.resolve(3000);

                    case 2:
                      result = _context8.sent;

                      ctx.swatchCtx.value = result;

                      _context8.next = 6;
                      return next();

                    case 6:
                    case 'end':
                      return _context8.stop();
                  }
                }
              }, _callee8, undefined);
            }));

            return function (_x5, _x6) {
              return _ref8.apply(this, arguments);
            };
          }()]
        }
      }
    });

    expose(app, model);

    request(http.createServer(app.callback())).get('/add').expect(200).end(function (err, res) {
      expect(err).to.equal(null);
      expect(res.body.ok).to.equal(true);
      expect(res.body.result).to.equal(2000);
      done();
    });
  });
});
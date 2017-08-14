'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var expect = require('chai').expect;
var swatch = require('swatchjs');
var handlers = require('../../lib/handlers');

describe('handlers', function () {
  describe('index', function () {
    it('should contain all verbs', function () {
      expect(handlers).to.be.an('object').that.has.all.keys('get', 'post');
    });
  });

  describe('verbs', function () {
    (0, _keys2.default)(handlers).forEach(function (verb) {
      describe(verb, function () {
        it('should write a JSON success response if function succeeds', function (done) {
          var fn = function fn(a, b) {
            return a + b;
          };
          var expected = {
            ok: true,
            result: 3
          };

          invokeHandler(fn, verb, expected).then(done);
        });

        it('should write a JSON error response if function throws a simple string', function (done) {
          var fn = function fn(a, b) {
            throw 'some_error';
          };
          invokeErrorHandler(fn, verb).then(done);
        });
        it('should write a JSON error response if function fails with Error', function (done) {
          var fn = function fn(a, b) {
            throw new Error('some_error');
          };
          invokeErrorHandler(fn, verb).then(done);
        });
      });
    });
  });
});

function invokeErrorHandler(fn, verb) {
  var expected = {
    ok: false,
    error: 'some_error'
  };
  return invokeHandler(fn, verb, expected);
}

function invokeHandler(fn, verb, expected) {
  var params = { a: 1, b: 2 };
  var request = {
    get body() {
      return params;
    }
  };
  var koaCtx = {
    get query() {
      return params;
    },
    get request() {
      return request;
    },
    set body(res) {
      expect(res).to.deep.equal(expected);
    }
  };

  var model = swatch({
    fn: {
      handler: fn
    }
  });
  var handler = handlers[verb](model[0]);

  return handler(koaCtx);
}
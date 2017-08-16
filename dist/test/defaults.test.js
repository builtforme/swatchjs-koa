'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var expect = require('chai').expect;
var defaults = require('../lib/defaults');
var handlers = require('../lib/handlers');

describe('defaults', function () {
  describe('options', function () {
    it('should include all default options', function () {
      var options = defaults();
      expect(options).to.be.an('object').that.has.all.keys('verbs', 'prefix', 'authAdapter');
    });
  });

  describe('verbs', function () {
    it('should throw if verbs is passed, but is not an array', function () {
      var options = {
        verbs: 1
      };
      expect(function () {
        return defaults(options);
      }).to.throw();
    });

    it('should throw if a requested verb is not supported', function () {
      var options = {
        verbs: ['test']
      };
      expect(function () {
        return defaults(options);
      }).to.throw();
    });

    it('should use the passed array', function () {
      var expectedVerbs = ['get'];
      var options = {
        verbs: expectedVerbs
      };
      expect(defaults(options).verbs).to.deep.equal(expectedVerbs);
    });

    it('should use the default verbs if a list is not passed in', function () {
      expect(defaults().verbs).to.deep.equal((0, _keys2.default)(handlers));
    });
  });

  describe('prefix', function () {
    it('should use the passed prefix', function () {
      var prefix = 'api';
      var options = {
        prefix: prefix
      };
      expect(defaults(options).prefix).to.equal('/' + prefix + '/');
    });

    it('should use the default prefix if not specified', function () {
      expect(defaults({}).prefix).to.equal('/');
    });
  });

  describe('authAdapter', function () {
    it('should throw if authAdapter is passed, but is not a function', function () {
      var options = {
        authAdapter: 1
      };
      expect(function () {
        return defaults(options);
      }).to.throw();
    });

    it('should use the passed auth function ', function (done) {
      function authAdapter() {
        return {
          test: '100'
        };
      }
      var options = {
        authAdapter: authAdapter
      };

      var setupCtx = {
        swatchCtx: {}
      };
      defaults(options).authAdapter(setupCtx, function () {
        expect(setupCtx.swatchCtx.auth).to.deep.equal({ test: '100' });
        done();
      });
    });

    it('should use the default auth adapter if not specified', function (done) {
      var setupCtx = {
        swatchCtx: {}
      };
      defaults({}).authAdapter(setupCtx, function () {
        expect(setupCtx.swatchCtx.auth).to.deep.equal({});
        done();
      });
    });

    it('should handle an error in the async auth adapter', function () {
      function authAdapter() {
        throw new Error('auth_error');
      }
      var options = {
        authAdapter: authAdapter
      };

      var emptyCtx = {};
      defaults(options).authAdapter(emptyCtx).then(function () {
        expect(emptyCtx.body.ok).to.equal(false);
        expect(emptyCtx.body.error).to.equal('auth_error');
      });
    });
  });
});
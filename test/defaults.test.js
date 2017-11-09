const expect = require('chai').expect;
const defaults = require('../lib/defaults');

describe('defaults', () => {
  describe('options', () => {
    it('should include all default options', () => {
      const options = defaults();
      expect(options).to.be.an('object').that.has.all.keys(
        'verbs', 'prefix', 'authAdapter', 'onException',
        'rawResponse', 'loggerRequestIdKey',
      );
    });
  });

  describe('verbs', () => {
    it('should throw if verbs is passed, but is not an array', () => {
      const options = {
        verbs: 1,
      };
      expect(() => defaults(options)).to.throw();
    });

    it('should throw if a requested verb is not supported', () => {
      const options = {
        verbs: ['test'],
      };
      expect(() => defaults(options)).to.throw();
    });

    it('should use the passed array', () => {
      const expectedVerbs = ['get'];
      const options = {
        verbs: expectedVerbs,
      };
      expect(defaults(options).verbs).to.deep.equal(expectedVerbs);
    });

    it('should use the default verbs if a list is not passed in', () => {
      expect(defaults().verbs).to.deep.equal(['get', 'post']);
    });
  });

  describe('prefix', () => {
    it('should use the passed prefix', () => {
      const prefix = 'api';
      const options = {
        prefix,
      };
      expect(defaults(options).prefix).to.equal(`/${prefix}/`);
    });

    it('should use the default prefix if not specified', () => {
      expect(defaults({}).prefix).to.equal('/');
    });
  });

  describe('authAdapter', () => {
    it('should throw if authAdapter is passed, but is not a function', () => {
      const options = {
        authAdapter: 1,
      };
      expect(() => defaults(options)).to.throw();
    });

    it('should use the passed auth function ', (done) => {
      function authAdapter() {
        return {
          test: '100',
        };
      }
      const options = {
        authAdapter,
      };

      const setupCtx = {
        swatchCtx: {},
      };
      defaults(options).authAdapter(setupCtx, () => {
        expect(setupCtx.swatchCtx.auth).to.deep.equal({ test: '100' });
        done();
      });
    });

    it('should use the default auth adapter if not specified', (done) => {
      const setupCtx = {
        swatchCtx: {},
      };
      defaults({}).authAdapter(setupCtx, () => {
        expect(setupCtx.swatchCtx.auth).to.deep.equal({});
        done();
      });
    });

    it('should handle an error in the async auth adapter', () => {
      function authAdapter() {
        throw new Error('auth_error');
      }
      const options = {
        authAdapter,
      };

      const emptyCtx = {};
      defaults(options).authAdapter(emptyCtx).then(() => {
        expect(emptyCtx.body.ok).to.equal(false);
        expect(emptyCtx.body.error).to.equal('auth_error');
      });
    });

    it('should handle an error in the async auth adapter with invalid logger ID', () => {
      function authAdapter() {
        throw new Error('auth_error');
      }
      const options = {
        authAdapter,
        loggerRequestIdKey: 'whoops',
      };

      let reqId = '';
      let reqKey = '';
      const emptyCtx = {
        reqId: '1234567890',
        set: (key, value) => {
          reqKey = key;
          reqId = value;
        },
      };
      defaults(options).authAdapter(emptyCtx).then(() => {
        expect(reqId).to.equal('');
        expect(reqKey).to.equal('');
        expect(emptyCtx.body.ok).to.equal(false);
        expect(emptyCtx.body.error).to.equal('auth_error');
      });
    });

    it('should handle an error in the async auth adapter with logger ID', () => {
      function authAdapter() {
        throw new Error('auth_error');
      }
      const options = {
        authAdapter,
        loggerRequestIdKey: 'reqId',
      };

      let reqId = '';
      let reqKey = '';
      const emptyCtx = {
        reqId: '1234567890',
        set: (key, value) => {
          reqKey = key;
          reqId = value;
        },
      };
      defaults(options).authAdapter(emptyCtx).then(() => {
        expect(reqId).to.equal('1234567890');
        expect(reqKey).to.equal('x-swatch-request-id');
        expect(emptyCtx.body.ok).to.equal(false);
        expect(emptyCtx.body.error).to.equal('auth_error');
      });
    });
  });

  describe('onException', () => {
    it('should throw if onException is passed, but is not a function', () => {
      const options = {
        onException: false,
      };
      expect(() => defaults(options)).to.throw();
    });

    it('should use the passed exception mapping function', () => {
      function onException(error) {
        if (error === 'test_error') {
          return 'actually_its_fine';
        }
        throw error;
      }
      const options = {
        onException,
      };

      const exceptionMap = defaults(options).onException;
      expect(() => exceptionMap('whatever')).to.throw('whatever');
      expect(exceptionMap('test_error')).to.equal('actually_its_fine');
    });

    it('should use the default exception function if not specified', () => {
      const exceptionMap = defaults({}).onException;
      expect(() => exceptionMap('whatever')).to.throw('whatever');
      expect(() => exceptionMap('test_error')).to.throw('test_error');
    });
  });

  describe('rawResponse', () => {
    it('should use the passed true rawResponse value', () => {
      const options = {
        rawResponse: true,
      };
      expect(defaults(options).rawResponse).to.equal(true);
    });

    it('should use the passed false rawResponse value', () => {
      const options = {
        rawResponse: false,
      };
      expect(defaults(options).rawResponse).to.equal(false);
    });

    it('should coerce the passed rawResponse value', () => {
      const options = {
        rawResponse: null,
      };
      expect(defaults(options).rawResponse).to.equal(false);
    });

    it('should default to false if not specified', () => {
      expect(defaults({}).rawResponse).to.equal(false);
    });
  });

  describe('loggerRequestIdKey', () => {
    it('should use the passed loggerRequestIdKey value', () => {
      const options = {
        loggerRequestIdKey: 'correlationId',
      };
      expect(defaults(options).loggerRequestIdKey).to.equal('correlationId');
    });

    it('should ignore an empty string', () => {
      const options = {
        loggerRequestIdKey: '',
      };
      expect(defaults(options).loggerRequestIdKey).to.equal(undefined);
    });

    it('should ignore a null input', () => {
      const options = {
        loggerRequestIdKey: null,
      };
      expect(defaults(options).loggerRequestIdKey).to.equal(undefined);
    });

    it('should ignore a non-string input', () => {
      const options = {
        loggerRequestIdKey: 10,
      };
      expect(defaults(options).loggerRequestIdKey).to.equal(undefined);
    });

    it('should default to undefined if not specified', () => {
      expect(defaults({}).loggerRequestIdKey).to.equal(undefined);
    });
  });
});

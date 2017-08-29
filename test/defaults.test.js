const expect = require('chai').expect;
const defaults = require('../lib/defaults');

describe('defaults', () => {
  describe('options', () => {
    it('should include all default options', () => {
      const options = defaults();
      expect(options).to.be.an('object').that.has.all.keys(
        'verbs', 'prefix', 'authAdapter', 'onException',
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
          return 'other_test_error';
        }
        return error;
      }
      const options = {
        onException,
      };

      const exceptionMap = defaults(options).onException;
      expect(exceptionMap('whatever')).to.equal('whatever');
      expect(exceptionMap('test_error')).to.equal('other_test_error');
    });

    it('should use the default exception function if not specified', () => {
      const exceptionMap = defaults({}).onException;
      expect(exceptionMap('whatever')).to.equal('whatever');
      expect(exceptionMap('test_error')).to.equal('test_error');
    });
  });
});

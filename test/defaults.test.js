'use strict';

const expect = require('chai').expect;
const defaults = require('../lib/defaults');
const handlers = require('../lib/handlers');

describe('defaults', () => {
  describe('options', () => {
    it('should include all default options', () => {
      const options = defaults();
      expect(options).to.be.an('object').that.has.all.keys(
        'verbs', 'prefix', 'authAdapter'
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
      expect(defaults().verbs).to.deep.equal(Object.keys(handlers));
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

    it('should use the passed auth function', () => {
      function authAdapter() {
        return {
          test: '100'
        };
      }
      const options = {
        authAdapter,
      };
      expect(defaults(options).authAdapter()).to.deep.equal({ test: '100' });
    });

    it('should use the default auth adapter if not specified', () => {
      expect(defaults({}).authAdapter()).to.deep.equal({});
    });
  })
});

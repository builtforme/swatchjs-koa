const expect = require('chai').expect;
const methods = require('../../lib/methods');

describe('methods', () => {
  describe('index', () => {
    it('should contain all verbs', () => {
      expect(methods).to.be.an('object').that.has.all.keys('get', 'post');
    });
  });

  describe('verbs', () => {
    const params = { a: 1, b: 2 };

    it('should get query params from a GET request', () => {
      const getCtx = {
        get query() {
          return params;
        },
      };
      expect(methods.get(getCtx)).to.deep.equal(params);
    });

    it('should get query params from a POST request', () => {
      const request = {
        get body() {
          return params;
        },
      };
      const postCtx = {
        get request() {
          return request;
        },
      };
      expect(methods.post(postCtx)).to.deep.equal(params);
    });
  });
});

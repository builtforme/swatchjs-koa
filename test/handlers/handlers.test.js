const expect = require('chai').expect;
const handlers = require('../../lib/handlers');

describe('handlers', () => {
  describe('index', () => {
    it('should contain all verbs', () => {
      expect(handlers).to.be.an('object').that.has.all.keys('get', 'post', 'handler');
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
      expect(handlers.get(getCtx)).to.deep.equal(params);
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
      expect(handlers.post(postCtx)).to.deep.equal(params);
    });
  });
});

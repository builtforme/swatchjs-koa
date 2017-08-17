'use strict';

var expect = require('chai').expect;
var handlers = require('../../lib/handlers');

describe('handlers', function () {
  describe('index', function () {
    it('should contain all verbs', function () {
      expect(handlers).to.be.an('object').that.has.all.keys('get', 'post', 'handler');
    });
  });

  describe('verbs', function () {
    var params = { a: 1, b: 2 };

    it('should get query params from a GET request', function () {
      var getCtx = {
        get query() {
          return params;
        }
      };
      expect(handlers.get(getCtx)).to.deep.equal(params);
    });

    it('should get query params from a POST request', function () {
      var request = {
        get body() {
          return params;
        }
      };
      var postCtx = {
        get request() {
          return request;
        }
      };
      expect(handlers.post(postCtx)).to.deep.equal(params);
    });
  });
});
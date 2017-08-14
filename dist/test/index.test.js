'use strict';

var expect = require('chai').expect;
var swatchExpress = require('..');

describe('index', function () {
  it('should be a function that exposes the API', function () {
    expect(swatchExpress).to.be.a('function');
  });
});
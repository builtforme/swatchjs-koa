const expect = require('chai').expect;
const swatchExpress = require('..');

describe('index', () => {
  it('should be a function that exposes the API', () => {
    expect(swatchExpress).to.be.a('function');
  });
});

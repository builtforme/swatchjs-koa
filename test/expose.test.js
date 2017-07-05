'use strict';

const expect = require('chai').expect;
const swatch = require('swatchjs');
const expose = require('../lib/expose');
const handlers = require('../lib/handlers');

function getApp() {
  let routes = {};
  return {
    use: r => {
      routes = r;
    },
    get routes() {
      return routes;
    },
  };
}

function getModel() {
  const model = swatch({
    "add": {
      handler: (a, b) => a + b,
    },
    "sub": {
      handler: (a, b) => a - b,
    },
  });

  return model;
};

describe('expose', () => {
  it('should only register the requested verbs', () => {
    const app = getApp();
    const model = getModel();
    const options = {
      verbs: [ 'get' ],
    };

    expose(app, model, options);

    expect(app.routes.router.match('/add', 'GET').route).to.be.true;
    expect(app.routes.router.match('/sub', 'GET').route).to.be.true;
  });

  it('should register all verbs if no verbs were specified', () => {
    const app = getApp();
    const model = getModel();

    expose(app, model);

    Object.keys(handlers).forEach(verb => {
      expect(app.routes.router.match('/add', verb.toUpperCase()).route).to.be.true;
      expect(app.routes.router.match('/sub', verb.toUpperCase()).route).to.be.true;
    });
  });

  it('should use the specified prefix', () => {
    const app = getApp();
    const model = getModel();

    const prefix = 'api';
    const options = {
      prefix,
    };

    expose(app, model, options);

    Object.keys(handlers).forEach(verb => {
      expect(app.routes.router.match(`/${prefix}/add`, verb.toUpperCase()).route).to.be.true;
      expect(app.routes.router.match(`/${prefix}/sub`, verb.toUpperCase()).route).to.be.true;
    });
  });
});

# swatchjs-koa

[![CircleCI](https://circleci.com/gh/builtforme/swatchjs-koa.svg?style=svg)](https://circleci.com/gh/builtforme/swatchjs-koa) | [![codecov](https://codecov.io/gh/builtforme/swatchjs-koa/branch/master/graph/badge.svg)](https://codecov.io/gh/builtforme/swatchjs-koa) | [![Coverage Status](https://coveralls.io/repos/github/builtforme/swatchjs-koa/badge.svg?branch=master)](https://coveralls.io/github/builtforme/swatchjs-koa?branch=master) | [![Known Vulnerabilities](https://snyk.io/test/github/builtforme/swatchjs-koa/badge.svg)](https://snyk.io/test/github/builtforme/swatchjs-koa)

An adapter to expose [swatchjs](https://www.npmjs.com/package/swatchjs) via [KOA](https://www.npmjs.com/package/koa).

## Quick start

The following exposes the simple API from the `swatchjs`'s README file:

```javascript
// Application server
const swatch = require('swatchjs');
const swatchKoa = require('swatchjs-koa');

const model = swatch({
    "numbers.add": (a, b) => Number(a) + Number(b),
    "numbers.sub": (a, b) => Number(a) - Number(b),
});

const app = Koa();
swatchKoa(app, model);
```

That's it! No HTTP headers, status codes, or any other distracting verbiage.
Each API method you declared can now be invoked using any of the supported HTTP
verbs.

**Note**:<br/>
It is strongly advised that you only enable your APIs over HTTPS. Read more
about [`HTTPS`](https://en.wikipedia.org/wiki/HTTPS#Overview) and why it's important
and how to use HTTPS with your [`node`](https://nodejs.org/api/https.html) server.
[`This tutorial`](https://engineering.circle.com/https-authorized-certs-with-node-js-315e548354a2)
also provides a walkthrough of the entire process, including certificate setup and configuration.

## Verbs

### GET

The `GET` binding expects all parameters to be passed in the query string.

For instance, using the popular [`request`](https://www.npmjs.com/package/request)
package, you would invoke the `numbers.add` method above as follows:

```javascript
// Client code (ex: Node server)
var request = require('request');

request('https://my-server/numbers.add?a=1&b=2');
```

**Note**:<br/>
Every parameter in the query string is received as, well, a string. So if you
plan on supporting the `GET` verb, it is recommended that either you provide
`parse` functions for each of your arguments, or that you validate and coerce
them inside your function (as shown in the example above).

### POST

The `POST` binding expects parameters to be passed in the `body` property of
KOA' request object.

Below is an example of calling the API using an `XMLHttpRequest` object:

```javascript
// Client code (ex: Browser JS)
function post(url, body) {
    var request = new XMLHttpRequest();

    request.open('POST', url);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(body));

    return request;
}

var request = post(
    'https://my-server/numbers.add',
    {
        a: 1,
        b: 2,
    });
```

**Note**<br/>

Be mindful that how the `body` property of KOA' request object gets
populated depends on which body-parsing middleware you have enabled.

There are popular libraries for KOA that enable the service to choose their
behavior with regards to body parsing. A popular one is
[`koa-bodyparser`](https://www.npmjs.com/package/koa-bodyparser).

If you have a simple JSON body parser, then it will parse `application/json`
content types, and your parameters could potentially have non-string types.

If, on the other hand, you have `application/x-www-form-urlencoded` parsing
enabled, then all parameters will be strings, and the same considerations of the
`GET` verb apply.

Security Notice: Remember that you may receive string objects using either approach,
which you should validate and coerce before passing to your handler functions.

## API reference

### The `swatchKoa` function

```javascript
// Application server
const swatchKoa = require('swatch-koa');

swatchKoa(app, model, options);
```

Loading this library will result in a function  (`swatchKoa` in the
example above) which takes the following parameters:

| Parameter | Required  | Description   |
|:---       |:---       |:---           |
|`app`      | Yes       | The KOA app to populate.              |
|`model`    | Yes       | The API model created by `swatchjs`.      |
|`options`  | No        | Additional options when exposing the API. When present, must be an object. |

The `options` object has the following properties:

| Property         | Example   | Default value     | Description   |
|:---              |:---       |:---               |:---           |
|`verbs`           |`['get']`  |`['get','post']`   | An array with a list of enabled HTTP verbs. Each verb must be a string. |
|`prefix`          |`'api'`    |`''`               | A URL prefix to be added to every route. For example, if the value of this option is `'product'`, then the URL of all APIs will start with `/product/`.   |
|`authAdapter`     |`fn`       |See below          | A function to perform authentication and extract credentials from a request. |
|`onException`     |`fn`       |See below          | A function to catch any exception and optionally rescue before returning an error. |
|`rawResponse`     |`boolean`  |`false`            | Returns the raw response object without the `{ ok: true }` or `{ ok: false }` wrapper. |
|`loggerRequestIdKey` |`string`   |`undefined`     | A string matching the koa-bunyan-logger key for `requestIdContext`.`prop` parameter. If present, the request ID will be returned in `x-swatch-request-id` response header. If empty, no header will be set. |

### The `authAdapter` function

Clients can specify a function to map an incoming KOA request into a custom
object containing user credentials or authentication details. The `authAdapter`
function is run as the first piece of middleware in any request. It should
have the following form:

```javascript
async function sampleAuthAdapter(koaCtx) {
  // Use koaCtx.request.headers to access headers
  var token = koaCtx.request.headers.authorization;

  // Validate authentication param synchronously
  //  or make an async call to a token service
  var userInfo = await externalTokenService.verify(token);

  // Throw an exception if authentication fails
  //                    OR
  // Return any object if authentication succeeds
  return {
    token: token,
    userName: userInfo.name,
    userRole: userInfo.role,
  };
}
```

If the authAdapter throws an exception, the request will short-circuit
and return the error code with status `ok: false`. If the authAdapter returns
any value, it will store the result under `swatchCtx.auth`. The result can
be accessed later, allowing clients to reuse any result in the handler.

### The `onException` function

Clients can specify a function that will execute whenever an error is thrown
from a handler. This function will run before a response is set, allowing the
client to handle the error. The `onException` function can do one of three things:

1. Re-throw to return the exception to client with `{ ok: false }` semantics
2. Throw an alternate exception to return to client with `{ ok: false }` semantics
3. Return any object to rescue the error and return to client with `{ ok: true }` semantics

The function must be synchronous, and should have the following form:

```javascript
function sampleOnException(error) {
  // Returning an object will rescue
  if (error === 'some_minor_error') {
    return { rescued_error: true };
  }

  // Map the error to another error by throwing
  if (error === 'some_internal_db_error') {
    throw 'generic_server_unavailable_error';
  }

  // Otherwise caller can re-throw the original
  throw error;
}
```

### The `loggerRequestIdKey` parameter

Clients can use the [koa-bunyan-logger](https://www.npmjs.com/package/koa-bunyan-logger) package
to configure a request logger for their service. That package exposes a `requestIdContext` function
that will generate a unique ID for each request to be included in the output logs. The unique ID is
saved on the KOA context object under a key you can specify with the `prop` parameter, with a
default value of `reqId`. See that package documentation for details.

Currently, `swatchjs-koa` supports this request logger as a part of the `swatchCtx`. To provide
additional debugging support, users can have the unique request ID included as a response header
named `x-swatchjs-request-id`. To enable this header, set the `loggerRequestId` property in the
`swatchjs-koa` configuration to a string that matches the `prop` parameter passed into the
`koa-bunyan-logger` configuration. This will allow `swatchjs-koa` to find the request ID parameter
from the KOA context. If not set, the header will not be included in the response.

### Middleware

The [swatchjs](https://www.npmjs.com/package/swatchjs) package allows the creation of middleware
functions to be executed before the API handler. Those middleware functions should be written
in the style of KOA middleware, accepting a Swatch context object and a callback function.
The Swatch context has a `ctx.req` property which contains the request parameters copied from
the [KOA](http://koajs.com/#context) `request` context.

## Developers

### Coding Style

This project follows the [AirBnB Javascript Coding Guidelines](https://github.com/airbnb/javascript) using [ESLint](http://eslint.org/) settings.

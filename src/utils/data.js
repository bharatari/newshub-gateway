const querystring = require('querystring');
const _ = require('lodash');
const request = require('request-promise-native');

module.exports = {
  services: [
    { 
      hostname: 'http://server:8080',
      name: 'newshub-server',
      endpoints: [
        '/api/building',
        '/api/device',
        '/api/image',
        '/api/organization',
        '/api/reservation',
        '/api/reset-password',
        '/api/role',
        '/api/room',
        '/api/room-reservation',
        '/api/signup-token',
        '/api/user',
        '/api/login',
      ],
    },
    {
      hostname: 'http://timesheet:8080',
      name: 'newshub-timesheet',
      endpoints: [
        '/api/event',
        '/api/log',
      ],
    },
  ],
  findService(url) {
    const endpoint = this.getEndpoint(url);

    for (let i = 0; i < this.services.length; i++) {
      const includes = _.includes(this.services[i].endpoints, endpoint);

      if (includes) {
        return this.services[i].hostname;
      }
    }

    throw new Error('Service not found');
  },
  getEndpoint(url) {
    const query = url.indexOf('?');

    if (query > -1) {
      url = url.substring(0, query);
    }

    const slashes = url.split('/').length - 1;

    if (slashes > 2) {
      const paramSlash = url.lastIndexOf('/');
      
      url = url.substring(0, paramSlash);
    }

    return url;
  },
  get(path, headers) {
    const service = this.findService(path);

    return request.get({
      url: `${service}${path}`,
      headers,
    });
  },
  post(path, body, headers) {
    const service = this.findService(path);

    return request.post({
      url: `${service}${path}`,
      headers,
      body,
    });
  },
  put(path, body, headers) {
    const service = this.findService(path);

    return request({
      method: 'PUT',
      url: `${service}${path}`,
      headers,
      body,
    });
  },
  delete(path, headers) {
    const service = this.findService(path);

    return request({
      method: 'DELETE',
      url: `${service}${path}`,
      headers,
    });
  },
  respond(ctx, response, next) {
    ctx.body = response;

    next();
  },
  handleError(ctx, e, next) {
    if (e.statusCode) {
      ctx.throw(e.statusCode, e.error);
    } else {
      ctx.throw(500);
    }

    next();
  }
};
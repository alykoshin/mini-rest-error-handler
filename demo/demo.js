'use strict';

const errors = require('mini-rest-errors');
const handler = require('../')({});


let req = {
};

let res = {
  headersSent: false,
  status: function(status) { console.log('*** res.status:', status); return this; },
  json:   function(json)   { console.log('*** res.json:', json);     return this; },
};

let next = function(err, req, res, next) {
  console.log('*** next(): err:', err);
};

let err;

err = 'test error string';
handler(err, req, res, next);

err = new Error('test Error object');
handler(err, req, res, next);

err = new errors.AppError('pageNotFound', 'some-message');
handler(err, req, res, next);

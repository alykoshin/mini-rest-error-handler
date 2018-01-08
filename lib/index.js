'use strict';

const _ = require('lodash');
const util = require('util');
const statusCodes = require('http').STATUS_CODES;
const errors = require('mini-rest-errors');

// define error-handling middleware last, after other app.use() and routes calls

module.exports = function(config) {
  config = config || {};
  config.console  = config.console || {};
  config.response = config.response || {};
  if (typeof config.response.details === 'undefined') config.response.details = false;

  function log(appError) {
    if (config.onError) {
      config.onError(appError);
    } else {
      // prepare and print to console
      let consoleMsg = '';
      consoleMsg += 'errorHandler(): Error: ' + util.inspect(appError);
      console.log(consoleMsg);
    }
  }

  const DEFAULT_CODE    = 'unknown';
  const DEFAULT_STATUS  = 500;
  const DEFAULT_MESSAGE = 'Internal Server Error';

  //log('NODE_ENV = \'' + process.env.NODE_ENV + '\'');

  return function(someError, req, res, next) {

    // sanitize error
    let sanitizedError;

    if ( !(someError instanceof errors.AppError) ) {
      if (typeof someError === 'object') {
        sanitizedError = new errors.AppError('unknownError', util.inspect(someError));

      } else if (typeof someError === 'string') {
        sanitizedError = new errors.AppError('unknownError', someError);

      } else {
        sanitizedError = new errors.AppError('unknownError', util.inspect(someError));

      }
    } else sanitizedError = someError;

    log(sanitizedError);

    // check if error happened when response is already in progress
    if (res.headersSent) {
      log(new errors.AppError('unknownError', 'warn: response headers already sent, calling next() to default error handler'));
      // pass original, not sanitized error - is there any difference?
      return next(someError);
    }

    // Hide details if needed in HTTP Response (default)
    if (!config.response.details) {
      let nonDetailedError = {
        status: sanitizedError.status || 500,
        message: statusCodes[sanitizedError.status] || statusCodes[500],
      };
      sanitizedError = nonDetailedError;
    }

    // set as HTTP response
    res
      .status(sanitizedError.status)
      .json( sanitizedError )
    /*			.format({
     'text/plain': function(){
     res.send(JSON.stringify(httpError,null,2));
     },

     'text/html': function(){
     res.send('<pre>'+httpError+'</pre>');
     },

     'application/json': function(){
     res.send( httpError );
     },

     'default': function() {
     // log the request and respond with 406
     res.status(406).send('Not Acceptable');
     }
     })*/
    ;

  };

};


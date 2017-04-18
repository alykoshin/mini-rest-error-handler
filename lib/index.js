'use strict';

const _ = require('lodash');
const util = require('util');
const statusCodes = require('http').STATUS_CODES;
const errors = require('mini-rest-errors');
//var errorHandler = require('error-handler');


// define error-handling middleware last, after other app.use() and routes calls


module.exports = function(config) {
  config = config || {};
  config.console  = config.console || {};
  config.response = config.response || {};


  function log(appError) {
    //msg = 'mini-rest-error-handler(): ' + msg;
    if (config.onError) {
      config.onError(appError);
    } else {
      // prepare and print to console
      let consoleMsg = '';
      consoleMsg += 'errorHandler(): Error: ' + util.inspect(appError);

      //if (config.console.stack404) {
      //  consoleMsg += '\nStack: ' + appError.stack;
      //}

      console.log(consoleMsg);
    }
  }

  const DEFAULT_CODE    = 'unknown';
  const DEFAULT_STATUS  = 500;
  const DEFAULT_MESSAGE = 'Internal Server Error';


  //log('NODE_ENV = \'' + process.env.NODE_ENV + '\'');

  return function(err, req, res, next) {

// sanitize error
//		var error = _.pick(err, ['code', 'status', 'message', 'details']);
    let appError;
    if ( !(err instanceof errors.AppError) ) {
      if (typeof err === 'object') {
        //let error = _.assignIn({}, err);
        //_.defaults(error, {
        //  code:    DEFAULT_CODE,
        //  status:  DEFAULT_STATUS,
        //  message: (typeof err === 'string') ? err : statusCodes[ error.status ] || DEFAULT_MESSAGE
        //});
        //appError = new errors.AppError('unknownError', util.inspect(error));
        appError = new errors.AppError('unknownError', util.inspect(err));

      } else if (typeof err === 'string') {
        appError = new errors.AppError('unknownError', err);
      } else {
        appError = new errors.AppError('unknownError', util.inspect(err));
      }
    } else appError = err;

      log(appError);

      //// prepare and set as HTTP response
      //let httpError = error;
      //if ((config.response.stack404 === true) || (config.response.stack404 === 'development') && (process.env.NODE_ENV === 'development')) {
      //  httpError = _.extend(httpError, { stack: err.stack });
      //}
    //var AppError = require('../../lib/appError');
    //var HTTPError = require('../../lib/httpError');
    //console.log('err instanceof');
    //console.log('Error:    ', err instanceof Error);
    //console.log('HTTPError:', err instanceof HTTPError);
    //console.log('AppError: ', err instanceof AppError);

    // check if error happened when response is already in progress
    if (res.headersSent) {
      log(new errors.AppError('unknownError', 'warn: response header already sent, calling next() to default error handler'));
      return next(err);
    }

    res
      //.status(httpError.status)
      .status(appError.status)
      //.json( httpError )
      .json( appError )
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


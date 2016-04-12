'use strict';

var _ = require('lodash');
var util = require('util');
var statusCodes = require('http').STATUS_CODES;
//var errorHandler = require('error-handler');


// define error-handling middleware last, after other app.use() and routes calls


module.exports = function(config) {
  config = config || {};
  config.console  = config.console || {};
  config.response = config.response || {};


  function log(msg) {
    msg = 'mini-rest-error-handler(): ' + msg;
    if (config.onError) {
      config.onError(msg);
    } else {
      console.log(msg);
    }
  }

  var DEFAULT_CODE    = 'unknown';
  var DEFAULT_STATUS  = 500;
  var DEFAULT_MESSAGE = 'Internal Server Error';


  log('NODE_ENV = \'' + process.env.NODE_ENV + '\'');

  return function(err, req, res, next) {

// sanitize error
//		var error = _.pick(err, ['code', 'status', 'message', 'details']);
    var error = _.assignIn({}, err);

    _.defaults(error, {
      code: DEFAULT_CODE,
      status: DEFAULT_STATUS,
      message: (typeof err === 'string') ? err : statusCodes[error.status] || DEFAULT_MESSAGE
    });

    // prepare and print to console
    var consoleMsg = '';
    consoleMsg = consoleMsg + 'errorHandler(): Error: ' + util.inspect(error);

    if (config.console.stack404) {
      consoleMsg = consoleMsg + '\nStack: ' + err.stack;
    }

    log(consoleMsg);

    // prepare and set as HTTP response
    var httpError = error;
    if ( (config.response.stack404 === true) || (config.response.stack404 === 'development') && (process.env.NODE_ENV === 'development') ) {
      httpError = _.extend(httpError, { stack: err.stack });
    }

    //var AppError = require('../../lib/appError');
    //var HTTPError = require('../../lib/httpError');
    //console.log('err instanceof');
    //console.log('Error:    ', err instanceof Error);
    //console.log('HTTPError:', err instanceof HTTPError);
    //console.log('AppError: ', err instanceof AppError);

    // check if error happened when response is already in progress
    if (res.headersSent) {
      log('warn: response header already sent, calling next() to default error handler');
      return next(err);
    }

    res
      .status(httpError.status)
      .json( httpError )
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


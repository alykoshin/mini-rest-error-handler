'use strict';

var _ = require('lodash');
var util = require('util');
var statusCodes = require('http').STATUS_CODES;
//var errorHandler = require('error-handler');


// define error-handling middleware last, after other app.use() and routes calls


module.exports = function(config) {

  var DEFAULT_CODE    = 'unknown';
  var DEFAULT_STATUS  = 500;
  var DEFAULT_MESSAGE = 'Internal Server Error';


  //if (process.env.NODE_ENV === 'development') {
  console.log('NODE_ENV = \'' + process.env.NODE_ENV + '\'');
  //}

  return function(err, req, res, next) {

    // check if error happened when response is already in progress
    if (res.headersSent) {
      return next(err);
    }

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
    consoleMsg = consoleMsg + ( parseInt(err.status) !== 404 ?  '\nStack: ' + err.stack : '');
    console.log(consoleMsg); // Print full error info to console

    // prepare and set as HTTP response
    var httpError = (process.env.NODE_ENV === 'development') ? _.extend(error, { stack: err.stack }) : error;

    //var AppError = require('../../lib/appError');
    //var HTTPError = require('../../lib/httpError');
    //console.log('err instanceof');
    //console.log('Error:    ', err instanceof Error);
    //console.log('HTTPError:', err instanceof HTTPError);
    //console.log('AppError: ', err instanceof AppError);

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


'use strict';
var winston = require('winston');
// winston.emitErrs = true;

var logger = new (winston.Logger)({
	transports: [
	  new (winston.transports.File)({
		name: 'info-file',
		filename: './logs/filelog-info.log',
		level: 'info',
		json:true
	  }),
	  new (winston.transports.File)({
		name: 'error-file',
		filename: './logs/filelog-error.log',
		level: 'error',
		json:true
	  })
	]
  });

module.exports = logger;

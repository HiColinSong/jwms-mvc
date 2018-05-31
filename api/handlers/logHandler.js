'use strict';
var fs = require('fs');
var readline = require('readline');
var stream = require('stream');

var instream = fs.createReadStream('./logs/filelog-error.log');
var outstream = new stream;
var rl = readline.createInterface(instream, outstream);

var logArray=[];
rl.on('line', function(line) {
  // process line here
  logArray.unshift(JSON.parse(line));
  
});

rl.on('close', function() {
	console.log(JSON.stringify(logArray,null,2));
  // do something on finish here
});
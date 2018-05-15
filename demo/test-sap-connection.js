"use strict";

var rfc = require('node-rfc');

var connParams =require("../db-config/.db-config.json").sapConnParams;

var client = new rfc.Client(connParams, true);

console.log('Client Version: ', client.getVersion());

console.log('Connecting...');
client.connect(function(err) {
  if (err) {
    return console.error('could not connect to server', err);
  }
  console.log("SAP Server connected successfully!")

  
});


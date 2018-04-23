// Copyright 2014 SAP AG.
//
//for Packing Reversal


"use strict";

var rfc = require('node-rfc');

var connParams = {
  user: 'yd.zhu',
  passwd: 'yadong123',
  ashost: '172.32.70.67',
  sysnr: '02',
  client: '200'
};

var client = new rfc.Client(connParams, true);

console.log('Client Version: ', client.getVersion());

console.log('Connecting...');
client.connect(function(err) {
  if (err) {
    return console.error('could not connect to server', err);
  }

  console.log('Invoking BAPI_HU_DELETE_FROM_DEL');
  client.invoke('BAPI_HU_DELETE_FROM_DEL',
    {DELIVERY:'0800401130',HUKEY:'20180422100000000002'},
    function(err, res) {
      if (err) {
        return console.error('Error invoking BAPI_HU_DELETE_FROM_DEL:', err);
      }
      console.log(res);
    });
  
});


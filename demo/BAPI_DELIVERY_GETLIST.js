// Copyright 2014 SAP AG.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http: //www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
// either express or implied. See the License for the specific
// language governing permissions and limitations under the License.
//TCODE: SE16 (Table browser)
//TCODE: EKKO (Header)
//TCODE: EKPO (Item)
//SE37: Check BAPI


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

  console.log('Invoking BAPI_DELIVERY_GETLIST');
  client.invoke('BAPI_DELIVERY_GETLIST',
    {
      IS_DLV_DATA_CONTROL:{
        HEAD_STATUS:"X",
        ITEM_STATUS:"X",
        ITEM:"X",
        HU_DATA:"X"
      },
       IT_VBELN:[{
        SIGN:"I",
        OPTION:"EQ",
        DELIV_NUMB_LOW:"0800401159" //add leading 0
        // DELIV_NUMB_LOW:"0800379646" //add leading 0
       }]
    },
    function(err, res) {
      if (err) {
        return console.error('Error invoking BAPI_DELIVERY_GETLIST:', err);
      }
      console.log(res);
    });
  
});


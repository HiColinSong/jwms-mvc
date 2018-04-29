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
// [‎02-‎Apr-‎18 5:43 PM]  Christian Kosasih Tan:  
// GR1 GR - PO
// GR1X  GR - PO - Cancellation
// GR2 GR - Production
// GR2X  GR - Production - Cancellation
// RSV Reservation
// RSVX  Reservation - Cancellation
// PIK Picking
// PIKX  Picking Cancellation
// PAK Packing
// PAKX  Packing Cancellation
// PGI PGI
// PGIX  PGI Cancellation
// PGR PGR
// PGRX  PGR Cancellation
// CFI Consignment fill up
// CPI Consignment pick up
// CRE Consignment Return
// CREX  Consignment Return Cancellation
// CIS Consignment Issue
// CISX  Consignment Issue Cancellation 
 


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

  console.log('Invoking BAPI_USER_GET_DETAIL');
  // client.invoke('BAPI_USER_GET_DETAIL',
  //   { USERNAME: 'yd.zhu' },
  //   function(err, res) {
  //     if (err) {
  //       return console.error('Error invoking BAPI_USER_GET_DETAIL:', err);
  //     }
  //     console.log(res);
  //   });
  console.log('Invoking ZIM_BX_STOCK_UPDATE');
    client.invoke('ZIM_BX_STOCK_UPDATE',
    {
      IT_BX_STOCK:[{
        // TRANS: 'PGI', //decrease
        TRANS: 'PGR', //increase
        WERKS:'2100',
        MATNR:'BFR1-3019',
        CHARG: 'W16120115',
        SERIAL:'SN100023',
        DOCNO: '1111',
        ENDCUST:'12333',
        BXDATE:'20180101',
        BXTIME:'000000',
        BXUSER:'yadong'
      }]
    },
    function(err, res) {
      if (err) {
        return console.error('Error invoking BAPI_USER_GET_DETAIL:', err);
      }
      console.log(res);
    });
});

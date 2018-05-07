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

  console.log('Invoking BAPI_OUTB_DELIVERY_CONFIRM_DEC');
  client.invoke('BAPI_OUTB_DELIVERY_CONFIRM_DEC',
  {
    "HEADER_DATA": {
      "DELIV_NUMB": "0800401206"
    },
    "HEADER_CONTROL": {
      "DELIV_NUMB": "0800401206"
    },
    "HANDLING_UNIT_HEADER": [
      {
        "DELIV_NUMB": "0800401206",
        "HDL_UNIT_EXID": "118050700000",
        "HDL_UNIT_EXID_TY": "F",
        "SHIP_MAT": "P-PA2.9010",
        "PLANT": "2100"
      },
      {
        "DELIV_NUMB": "0800401206",
        "HDL_UNIT_EXID": "118050700002",
        "HDL_UNIT_EXID_TY": "F",
        "SHIP_MAT": "P-PA2.9010",
        "PLANT": ""
      }
    ],
    "HANDLING_UNIT_ITEM": [
      {
        "DELIV_NUMB": "0800401206",
        "DELIV_ITEM": "000002",
        "HDL_UNIT_EXID_INTO": "118050700000",
        "PACK_QTY": 1
      },
      {
        "DELIV_NUMB": "0800401206",
        "DELIV_ITEM": "000001",
        "HDL_UNIT_EXID_INTO": "118050700000",
        "PACK_QTY": 1
      },
      {
        "DELIV_NUMB": "0800401206",
        "DELIV_ITEM": "000001",
        "HDL_UNIT_EXID_INTO": "118050700000",
        "PACK_QTY": 1
      },
      {
        "DELIV_NUMB": "0800401206",
        "DELIV_ITEM": "000002",
        "HDL_UNIT_EXID_INTO": "118050700000",
        "PACK_QTY": 1
      },
      {
        "DELIV_NUMB": "0800401206",
        "DELIV_ITEM": "000001",
        "HDL_UNIT_EXID_INTO": "118050700000",
        "PACK_QTY": 1
      },
      {
        "DELIV_NUMB": "0800401206",
        "DELIV_ITEM": "000001",
        "HDL_UNIT_EXID_INTO": "118050700000",
        "PACK_QTY": 1
      },
      {
        "DELIV_NUMB": "0800401206",
        "DELIV_ITEM": "000001",
        "HDL_UNIT_EXID_INTO": "118050700000",
        "PACK_QTY": 1
      },
      {
        "DELIV_NUMB": "0800401206",
        "DELIV_ITEM": "000002",
        "HDL_UNIT_EXID_INTO": "118050700000",
        "PACK_QTY": 1
      },
      {
        "DELIV_NUMB": "0800401206",
        "DELIV_ITEM": "000002",
        "HDL_UNIT_EXID_INTO": "118050700002",
        "PACK_QTY": 1
      },
      {
        "DELIV_NUMB": "0800401206",
        "DELIV_ITEM": "000002",
        "HDL_UNIT_EXID_INTO": "118050700002",
        "PACK_QTY": 1
      }
    ]
  },
    function(err, res) {
      if (err) {
        return console.error('Error invoking BAPI_OUTB_DELIVERY_CONFIRM_DEC:', err);
      }
      console.log(res);console.log('Invoking BAPI_TRANSACTION_COMMIT');
      client.invoke('BAPI_TRANSACTION_COMMIT',
        {WAIT:'X'},
        function(err, res) {
          if (err) {
            return console.error('Error invoking BAPI_TRANSACTION_COMMIT:', err);
          }
          console.log(res);
        });

    });
  
});


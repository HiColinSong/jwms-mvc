"use strict";

const r3connect = require('r3connect');

const configuration  = {
  // "username": "BX_USER",
  // "password": "P@ssw0rd",
  // "applicationServer": "172.32.70.71",
  // "instanceNumber": "00",
  // "client": "500"
  username: 'yd.zhu',
  password: 'yadong123',
  applicationServer: '172.32.70.67',
  instanceNumber: '02',
  client: '200'
};

r3connect.Pool.get(configuration).acquire()
.then(function (client) {
  // Actually call the back-end
  return client.invoke('BAPI_DELIVERY_GETLIST', 
  {
    IS_DLV_DATA_CONTROL:{
      HEAD_STATUS:"X",
      ITEM_STATUS:"X",
      ITEM:"X",
      HU_DATA:"X",
      HEAD_PARTNER:"X"
    },
      IT_VBELN:[{
      SIGN:"I",
      OPTION:"EQ",
      // DELIV_NUMB_LOW:"0800401144" //add leading 0
      DELIV_NUMB_LOW:"0800401256 " //add leading 0
      }]
  });
})
.then(function (response) {
  // Output response
      console.log(JSON.stringify(response,null,2));
      r3connect.Pool.destory();
})
.catch(function (error) {
  // Output error
    console.error('Error invoking BAPI_DELIVERY_GETLIST:', error);
});



// var client = new rfc.Client(connParams, true);

// console.log('Client Version: ', client.getVersion());

// console.log('Connecting...');
// client.connect(function(err) {
//   if (err) {
//     return console.error('could not connect to server', err);
//   }

//   console.log('Invoking BAPI_DELIVERY_GETLIST');
//   client.invoke('BAPI_DELIVERY_GETLIST',
//     {
//       IS_DLV_DATA_CONTROL:{
//         HEAD_STATUS:"X",
//         ITEM_STATUS:"X",
//         ITEM:"X",
//         HU_DATA:"X",
//         HEAD_PARTNER:"X"
//       },
//        IT_VBELN:[{
//         SIGN:"I",
//         OPTION:"EQ",
//         // DELIV_NUMB_LOW:"0800401144" //add leading 0
//         DELIV_NUMB_LOW:"0800401225 " //add leading 0
//        }]
//     },
//     function(err, res) {
//       if (err) {
//         return console.error('Error invoking BAPI_DELIVERY_GETLIST:', err);
//       }
//       console.log(res);
//     });
  
// });


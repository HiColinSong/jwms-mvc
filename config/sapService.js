'use strict';

 var rfc = require('node-rfc');
 var Promise = require('Promise').default;
 const util = require('./util');
var connParams = {
  user: 'yd.zhu',
  passwd: 'yadong123',
  ashost: '172.32.70.67',
  sysnr: '02',
  client: '200'
};

var client = new rfc.Client(connParams, true);

console.log('Client Version: ', client.getVersion());

exports.getDeliveryOrder=function(orderNo){
	var param = {
      IS_DLV_DATA_CONTROL:{
        HEAD_STATUS:"X",
        ITEM:"X",
        HU_DATA:"X"
      },
       IT_VBELN:[{
        SIGN:"I",
        OPTION:"EQ",
        DELIV_NUMB_LOW:orderNo //add leading 0
       }]
    };
    return invokeBAPI("BAPI_DELIVERY_GETLIST",param);
};

exports.getPurchaseOrder=function(orderNo){
	var param ={PURCHASEORDER : orderNo};
    return invokeBAPI("BAPI_PO_GETDETAIL",param);
};

exports.getTransferOrder=function(orderNo,warehouseNo){
	var param ={WHSENUMBER : warehouseNo,TRANSFERORDERNO:orderNo};
    return invokeBAPI("BAPI_WHSE_TO_GET_DETAIL",param);
};

var invokeBAPI = function(bapiName,param){
	return new Promise(function(resolve,reject){
	    client.connect(function(err) {
		  if (err) {
		  	reject(err);
		    // return console.error('could not connect to server', err);
		  }
		  client.invoke(bapiName, param,
		    function(err, res) {
		      if (err) {
		        // return console.error('Error invoking BAPI_PO_GETDETAIL:', err);
		        reject(err);
		      }
		      console.log("Invoking "+bapiName+" successfully");
		      resolve(res);
		    });
		  
		});
    });
}




'use strict';

 var rfc = require('node-rfc');
 var Promise = require('Promise').default;
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
        ITEM_STATUS:"X",
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

exports.confirmPacking=function(order){
	var params = {
    HEADER_DATA:{DELIV_NUMB:order.DONumber},
    HEADER_CONTROL:{DELIV_NUMB:order.DONumber},
    HANDLING_UNIT_HEADER:[],
      HANDLING_UNIT_ITEM:[]
  };
  for (let i = 0; i < order.HUList.length; i++) {
      const hu = order.HUList[i];
      params.HANDLING_UNIT_HEADER.push(
          { 
            DELIV_NUMB: order.DONumber, 
            HDL_UNIT_EXID:hu.HUNumber, 
            HDL_UNIT_EXID_TY:"F",
            SHIP_MAT:"C-10832-000", 
            PLANT:order.Plant
          }
      );
      for (let j = 0; j < hu.scannedItems.length; j++) {
        const scannedItem = hu.scannedItems[j];
          params.HANDLING_UNIT_ITEM.push(
              { 
                DELIV_NUMB: order.DONumber, 
                DELIV_ITEM:scannedItem.DOItemNumber,
                HDL_UNIT_EXID_INTO:scannedItem.HUNumber, 
                PACK_QTY:scannedItem.ScanQty
              }
          );
      }
    }
    return new Promise(function(resolve,reject){
      // resolve("success");
      // resolve("fail");
      reject("unknown issue");
    })
    // return invokeBAPI("BAPI_OUTB_DELIVERY_CONFIRM_DEC",params,true);
};

exports.getPurchaseOrder=function(orderNo){
	var param ={PURCHASEORDER : orderNo};
    return invokeBAPI("BAPI_PO_GETDETAIL",param);
};

exports.getTransferOrder=function(orderNo,warehouseNo){
	var param ={WHSENUMBER : warehouseNo,TRANSFERORDERNO:orderNo};
    return invokeBAPI("BAPI_WHSE_TO_GET_DETAIL",param);
};

var invokeBAPI = function(bapiName,param,transactionCommit){
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
          if (transactionCommit){
            console.log("Invoking BAPI_TRANSACTION_COMMIT");
            client.invoke('BAPI_TRANSACTION_COMMIT',
              {WAIT:'X'},
              function(err, res) {
                if (err) {
                  // return console.error('Error invoking BAPI_TRANSACTION_COMMIT:', err);
                  reject(err);
                }
                console.log(res);
                resolve(res);
              });
          } else{
            resolve(res);
          }
		    });
		  
		});
    });
}
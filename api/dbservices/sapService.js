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
            SHIP_MAT:hu.PackMaterial, 
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
    // return new Promise(function(resolve,reject){
    //   resolve("success");
    //   // resolve("fail");
    //   // reject("unknown issue");
    // })
    return invokeBAPI("BAPI_OUTB_DELIVERY_CONFIRM_DEC",params,true);
};

exports.packingReversal = function(orderNo,HUNumber){
  var param ={DELIVERY:orderNo,HUKEY:HUNumber};
    return invokeBAPI("BAPI_HU_DELETE_FROM_DEL",param);
}

exports.pgiUpdate = function(orderNo,currentDate){
  var param ={ 
      VBKOK_WA:{vbeln_vl:orderNo,wabuc: "X",wadat_ist: currentDate},
      commit:'X',
      Delivery:orderNo
    };
    return invokeBAPI("WS_DELIVERY_UPDATE",param);
}

exports.pgiReversal = function(orderNo,currentDate){
  var param ={
      I_VBELN:orderNo,
      I_BUDAT:currentDate,
      I_BUDAT:'J',
      I_COUNT:'001',
      I_TCODE:'VL09',
      I_COMMIT:'X'
    }
    return invokeBAPI("Z_WS_REVERSE_GOODS_ISSUE",param);
}

exports.reservation = function(ordero,currentDate){
  var param ={ 
      GOODSMVT_HEADER:{PSTNG_DATE:currentDate},
      GOODSMVT_CODE:{GM_CODE:"06"},
      GOODSMVT_ITEM: [
        {PLANT:order.plant,ENTRY_QNT:order.quantity, RESERV_NO: order.orderNo, RES_ITEM: order.itemNo}        
      ]
  }
    return invokeBAPI("BAPI_GOODSMVT_CREATE",param);
}

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
            transactionCommit=false;
          }
          if (res.RETURN&&res.RETURN.length>0&&res.RETURN[0].TYPE==='E'){ 
            resolve(res);
            // reject(res.RETURN[0].MESSAGE);
            transactionCommit=false;
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
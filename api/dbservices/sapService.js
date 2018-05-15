'use strict';

 var rfc = require('node-rfc');
 var Promise = require('Promise').default;
 var connParams =require("../../db-config/.db-config.json").sapConnParams;

 var client = new rfc.Client(connParams, true);

console.log('Client Version: ', client.getVersion());

exports.getDeliveryOrder=function(orderNo){
	var param = {
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
      if (hu.scannedItems&&hu.scannedItems.length>0){ //confirm not an empty HU
        params.HANDLING_UNIT_HEADER.push(
            { 
              DELIV_NUMB: order.DONumber, 
              HDL_UNIT_EXID:hu.HUNumber, 
              HDL_UNIT_EXID_TY:"F",
              SHIP_MAT:hu.PackMaterial, 
              PLANT:order.plannedItems[0].Plant
            }
        );
        for (let j = 0; j < hu.scannedItems.length; j++) {
          const scannedItem = hu.scannedItems[j];
            params.HANDLING_UNIT_ITEM.push(
                { 
                  DELIV_NUMB: order.DONumber, 
                  DELIV_ITEM:scannedItem.DOItemNumber,
                  HDL_UNIT_EXID_INTO:scannedItem.HUNumber, 
                  PACK_QTY:scannedItem.ScanQty,
                  MATERIAL:scannedItem.MaterialCode,
                  BATCH:scannedItem.BatchNo
                }
            );
        }
      }
    }
    return invokeBAPI("BAPI_OUTB_DELIVERY_CONFIRM_DEC",params,true);
};

exports.packingReversal = function(orderNo,HUNumber){
  var param ={DELIVERY:orderNo,HUKEY:HUNumber};
    return invokeBAPI("BAPI_HU_DELETE_FROM_DEL",param,true);
}

exports.pgiUpdate = function(orderNo,currentDate){
  var param ={ 
      VBKOK_WA:{VBELN_VL:orderNo,WABUC: "X",WADAT_IST: currentDate},
      COMMIT:'X',
      DELIVERY:orderNo
    };
    return invokeBAPI("WS_DELIVERY_UPDATE",param);
}

exports.pgiReversal = function(orderNo,currentDate){
  var param ={
      I_VBELN:orderNo,
      I_BUDAT:currentDate,
      I_VBTYP:'J',
      I_COUNT:'001',
      I_TCODE:'VL09',
      I_COMMIT:'X'
    }
    return invokeBAPI("Z_WS_REVERSE_GOODS_ISSUE",param);
}

exports.rgaReversal = function(orderNo,currentDate){
     return this.pgiReversal(orderNo,currentDate);
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

exports.confirmPicking=function(orderNo,warehouseNo,items){
	var param={
        I_LGNUM : warehouseNo,
        I_TANUM:orderNo,
        // T_LTAP_CONF : [{ TANUM:orderNo, TAPOS:"0001", SQUIT:"X"}],
        I_UPDATE_TASK:"X",
        I_COMMIT_WORK:"X"
      };
      param.T_LTAP_CONF=[];
      for (let i = 0; i < items.length; i++) {
        param.T_LTAP_CONF.push({
          TANUM:orderNo,
          TAPOS:items[i].TOItemNumber,
          SQUIT:"X"
        });
      }
    return invokeBAPI("L_TO_CONFIRM",param);
};

exports.PickingReversals=function(order,warehouseNo){
	var param={
      I_LGNUM:warehouseNo,
      I_TANUM:order.TONumber,
      T_LTAP_CANCL:[],
      I_COMMIT_WORK:'X'
    };
    for (let i = 0; i < order.plannedItems.length; i++) {
      const item = order.plannedItems[i];
      if (item.reversal){
        param.T_LTAP_CANCL.push({
          TANUM:order.TONumber,
          TAPOS:item.TOItemNumber
        })
      }
    }
    return invokeBAPI("L_TO_CANCEL",param);
};

exports.serialNoUpdate=function(param){
    return invokeBAPI("ZIM_BX_STOCK_UPDATE",param);
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
            client.close();
            return
          }
          if (res&&res.RETURN&&res.RETURN.length>0&&res.RETURN[0].TYPE==='E'){ 
            // resolve(res);
            reject(res.RETURN[0].MESSAGE);
            transactionCommit=false;
            client.close();
            return
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
                  client.close();
                }
                console.log(res);
                resolve(res);
                client.close();
              });
          } else{
            resolve(res);
            client.close();
          }
		    });
		  
		});
    });
}
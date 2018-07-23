'use strict';
  const logger = require("../config/logger"); 
 const r3connect = require('r3connect');
 r3connect.Client.options.invokeTimeout=30*1000*60; //timeout 30 miniutes
 var client;
 const Promise = require('Promise').default;
//  const configuration =require("../../db-config/.db-config.json").sapConnParams;
 const configuration =require('../config/appConfig').getInstance().getSapConnParam();
exports.getDeliveryOrder=function(orderNo,isHU_DATA){
	var param = {
      IS_DLV_DATA_CONTROL:{
        HEAD_STATUS:"X",
        ITEM_STATUS:"X",
        ITEM:"X",
        // HU_DATA:"X",
        HEAD_PARTNER:"X"
      },
       IT_VBELN:[{
        SIGN:"I",
        OPTION:"EQ",
        DELIV_NUMB_LOW:orderNo //add leading 0
       }]
    };
    if (isHU_DATA){
      param.IS_DLV_DATA_CONTROL.HU_DATA="X";
    }
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
    return invokeBAPI("BAPI_OUTB_DELIVERY_CONFIRM_DEC",params,true,true);
};

exports.packingReversal = function(orderNo,HUNumber){
  var param ={DELIVERY:orderNo,HUKEY:HUNumber};
    return invokeBAPI("BAPI_HU_DELETE_FROM_DEL",param,true,true);
}

exports.packingStatusUpdate = function(orderNo){
  var param ={IM_VBELN :orderNo};
    return invokeBAPI("Z_SD_UPDATE_DN_STATUS",param,false,true);
}

exports.pgiUpdate = function(orderNo,currentDate,warehouseNo){
  var param ={ 
      VBKOK_WA:{
        VBELN_VL:orderNo,
        WABUC: "X",
        WADAT_IST: currentDate,
        SPE_RESET_VLSTK:'X'
      },
      COMMIT:'X',
      // SYNCHRON:'X',
      DELIVERY:orderNo,
      IF_DATABASE_UPDATE:"1"
    };
    return invokeBAPI("Z_WS_DELIVERY_UPDATE",param,false,true);
}

exports.pgrUpdate = function(orderNo,currentDate,warehouseNo){
  var param ={ 
      VBKOK_WA:{
        VBELN_VL:orderNo,
        WABUC: "X",
        SPE_AUTO_GR:'X',
        WADAT_IST: currentDate,
        SPE_RESET_VLSTK:'X'
      },
      COMMIT:'X',
      SYNCHRON:'X',
      DELIVERY:orderNo,
      IF_DATABASE_UPDATE:"1"
    };
    return invokeBAPI("Z_WS_DELIVERY_UPDATE",param,false,true);
}

exports.pgiReversal = function(orderNo,deliveryType,currentDate){
  var param ={
      I_VBELN:orderNo,
      I_BUDAT:currentDate,
      I_VBTYP:'J',
      I_COUNT:'001',
      I_TCODE:'VL09',
      I_COMMIT:'X'
    }
    return invokeBAPI("Z_WS_REVERSE_GOODS_ISSUE",param,false,true);
}
exports.pgrReversal = function(orderNo,deliveryType,currentDate){
  var param ={
      I_VBELN:orderNo,
      I_BUDAT:currentDate,
      I_VBTYP:'J',
      // I_VBTYP:deliveryType,
      I_COUNT:'001',
      I_TCODE:'VL09',
      I_COMMIT:'X'
    }
    return invokeBAPI("Z_WS_REVERSE_GOODS_ISSUE",param,false,true);
}

// exports.rgaReversal = function(orderNo,currentDate,warehouseNo){
//      return this.pgiReversal(orderNo,currentDate,warehouseNo);
// }

exports.reservation = function(order,currentDate){
  var param ={ 
      GOODSMVT_HEADER:{PSTNG_DATE:currentDate},
      GOODSMVT_CODE:{GM_CODE:"06"},
      GOODSMVT_ITEM: []
  }
  for (let i = 0; i < order.plannedItems.length; i++) {
    const item = order.plannedItems[i];
    if (item.posting){ //only posting the selected item, i.e. partial posting
      param.GOODSMVT_ITEM.push(
        {
          PLANT:item.Plant,
          ENTRY_QNT:item.Quantity, 
          RESERV_NO: order.ResvNo, 
          RES_ITEM: item.ResvItemNumber,
          MOVE_TYPE: order.moveType
        }
      )
    }
  }
    return invokeBAPI("BAPI_GOODSMVT_CREATE",param,true,true);
}

exports.getPurchaseOrder=function(orderNo){
	var param ={PURCHASEORDER : orderNo};
    return invokeBAPI("BAPI_PO_GETDETAIL",param);
};

exports.getTransferOrder=function(orderNo,warehouseNo){
	var param ={WHSENUMBER : warehouseNo,TRANSFERORDERNO:orderNo};
    return invokeBAPI("BAPI_WHSE_TO_GET_DETAIL",param);
};

exports.getCustomerDetail=function(customerNo){
    return invokeBAPI("BAPI_CUSTOMER_GETDETAIL2",{CUSTOMERNO:customerNo});
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
        if (items[i].Cancel!=='X')
          param.T_LTAP_CONF.push({
            TANUM:orderNo,
            TAPOS:items[i].TOItemNumber,
            SQUIT:"X"
          });
      }
    return invokeBAPI("L_TO_CONFIRM",param,false,true);
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
    return invokeBAPI("L_TO_CANCEL",param,false,true);
};

exports.serialNoUpdate=function(param){
    return invokeBAPI("ZIM_BX_STOCK_UPDATE",param,false,true);
};
exports.getReservationDoc=function(resvNo){
    var param = {RESERVATION:resvNo};
    return invokeBAPI("BAPI_RESERVATION_GETDETAIL",param);
};

var invokeBAPI = function(bapiName,param,transactionCommit,reconnectRequired){
	return new Promise(function(resolve,reject){
    r3connect.Pool.get(configuration).acquire()
    .then(function (rfcClient) {
      // Actually call the back-end
      client = rfcClient;
      return client.invoke(bapiName, param);
    })
    .then(function (response) {
          var res=response[0];
          if (res&&res.RETURN&&res.RETURN.length>0&&res.RETURN[0].TYPE==='E'){ 
            console.log("Invoking "+bapiName+" failed:"+res.RETURN[0].MESSAGE);
            throw new Error(res.RETURN[0].MESSAGE);
            transactionCommit=false;
          } else if (transactionCommit){
              console.log("Invoking BAPI_TRANSACTION_COMMIT");
              return client.invoke('BAPI_TRANSACTION_COMMIT',{WAIT:'X'});
          }else {
            console.log("Invoking "+bapiName+" successfully");
            return response;
          }
    })
    .then(function(response){
           resolve(response[0]);
           if (reconnectRequired)
              reconnect();
    })
    .catch(function (error) {
      // Output error
        console.error('Error invoking'+bapiName+' :', error);

        logger.error({bapiName:bapiName,param:param,error:(error.message||error)});
        if (reconnectRequired)
          reconnect();
        reject (error);
    });
    });
}

var reconnect = function(){
  r3connect.Pool.remove(configuration);
  r3connect.Pool.get(configuration);
}
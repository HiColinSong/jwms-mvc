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

var test_BAPI_DELIVERY_GETLIST = function(){
  let param = {
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
    DELIV_NUMB_LOW:"0800401272 " //add leading 0
    }]
  }
  return invokeBAPI("BAPI_DELIVERY_GETLIST",param);
}

var test_BAPI_GOODSMVT_CREATE = function(){
  // let param = { GOODSMVT_HEADER:{PSTNG_DATE:"20180605"},
  //     GOODSMVT_CODE:{GM_CODE:"06"},
  //     GOODSMVT_ITEM: [
  //       {PLANT:"2100",ENTRY_QNT:1, RESERV_NO: "0001687566", RES_ITEM: "0001"}
  //       ]
  //   }
  let param={
    "GOODSMVT_HEADER": {
      "PSTNG_DATE": "20180608"
    },
    "GOODSMVT_CODE": {
      "GM_CODE": "06"
    },
    "GOODSMVT_ITEM": [
      {
        "PLANT": "2100",
        "ENTRY_QNT": 1,
        "RESERV_NO": "0001687562",
        "RES_ITEM": "0001",
        "MOVE_TYPE":"905"
      }
    ]
  }
  return invokeBAPI("BAPI_GOODSMVT_CREATE",param);
}

var test_BAPI_GOODSMVT_CANCEL = function(){
  let param = { 
      MATERIALDOCUMENT :'4901435052 ',
      MATDOCUMENTYEAR:'2018'
    }
  return invokeBAPI("BAPI_GOODSMVT_CANCEL",param);
}

var test_BAPI_HU_CREATE = function(){
  let param = {
      HEADERPROPOSAL:{ PACK_MAT:"C-10832-000", EXT_ID_HU_2:"20 digits BX HUNo" },
    HUITEM:[{ PACK_QTY:10, MATERIAL:"BMXP-2208"}]
    }
  return invokeBAPI("BAPI_HU_CREATE",param);
}

var test_BAPI_HU_DELETE_FROM_DEL = function(){
  let param =  {DELIVERY:'0800401130',HUKEY:'20180422100000000002'};
  return invokeBAPI("BAPI_HU_DELETE_FROM_DEL",param);
}

var test_L_TO_CANCEL = function(){
  let param = {I_LGNUM:'Z01',I_TANUM:'2000178282',I_COMMIT_WORK:'X'};
  return invokeBAPI("L_TO_CANCEL",param);
}

var test_L_TO_CONFIRM = function(){
  let param = {
                I_LGNUM : 'Z01',I_TANUM:'2000178282',
                T_LTAP_CONF : [{ TANUM:"2000178282", TAPOS:"0001", SQUIT:"X"}],
                I_UPDATE_TASK:"X"
              }
  return invokeBAPI("L_TO_CONFIRM",param);
}

var test_BAPI_OUTB_DELIVERY_CONFIRM_DEC = function(){
  let param = {
    "HEADER_DATA": {
      "DELIV_NUMB": "0800401225"
    },
    "HEADER_CONTROL": {
      "DELIV_NUMB": "0800401225"
    },
    "HANDLING_UNIT_HEADER": [
      {
        "DELIV_NUMB": "0800401225",
        "HDL_UNIT_EXID": "118051600000",
        "HDL_UNIT_EXID_TY": "F",
        "SHIP_MAT": "C-10832-001",
        "PLANT": "2100"
      }
    ],
    "HANDLING_UNIT_ITEM": [
      {
        "DELIV_NUMB": "0800401225",
        "DELIV_ITEM": "1",
        "HDL_UNIT_EXID_INTO": "118051600000",
        "PACK_QTY": 1,
        "MATERIAL": "000000000000096346",
        "BATCH": "1000052021"
      },
      {
        "DELIV_NUMB": "0800401225",
        "DELIV_ITEM": "4",
        "HDL_UNIT_EXID_INTO": "118051600000",
        "PACK_QTY": 1,
        "MATERIAL": "LAH25018P",
        "BATCH": "P2H40709A"
      },
      {
        "DELIV_NUMB": "0800401225",
        "DELIV_ITEM": "2",
        "HDL_UNIT_EXID_INTO": "118051600000",
        "PACK_QTY": 1,
        "MATERIAL": "000000000067208000",
        "BATCH": "17629907"
      },
      {
        "DELIV_NUMB": "0800401225",
        "DELIV_ITEM": "3",
        "HDL_UNIT_EXID_INTO": "118051600000",
        "PACK_QTY": 1,
        "MATERIAL": "BFR1-2208",
        "BATCH": "W15090443Z"
      }
    ]
  };
  return invokeBAPI("BAPI_OUTB_DELIVERY_CONFIRM_DEC",param);
}

var test_BAPI_PO_GETDETAIL = function(){
  let param = {PURCHASEORDER : ' 7000001017'};
  return invokeBAPI("BAPI_PO_GETDETAIL",param);
}

var test_BAPI_RESERVATION_GETDETAIL = function(){
  let param = {RESERVATION:'0001687562'};
  return invokeBAPI("BAPI_RESERVATION_GETDETAIL",param);
}

var test_BAPI_CUSTOMER_GETDETAIL2 = function(){
  let param = {CUSTOMERNO:'0000200070'};
  return invokeBAPI("BAPI_CUSTOMER_GETDETAIL2",param);
}

var test_BAPI_WHSE_TO_GET_DETAIL = function(){
  let param = {WHSENUMBER : 'Z01',TRANSFERORDERNO:'2000178345'};
  return invokeBAPI("BAPI_WHSE_TO_GET_DETAIL",param);
}

var test_Z_WS_DELIVERY_UPDATE = function(){
  let param = {
                "VBKOK_WA": {
                  "VBELN_VL": "0800401239",
                  "WABUC": "X",
                  "WADAT_IST": "20180517",
                },
                "COMMIT":"X",
                "DELIVERY":"0800401239",
                "IF_DATABASE_UPDATE":"1"
              };
  return invokeBAPI("Z_WS_DELIVERY_UPDATE",param);
}
var test_Z_WS_REVERSE_GOODS_ISSUE = function(){
  let param = {I_VBELN:'0800401130',I_BUDAT:20180420,I_BUDAT:'J',I_COUNT:'001',I_TCODE:'VL09'};
  return invokeBAPI("Z_WS_REVERSE_GOODS_ISSUE",param);
}
var test_L_TO_CONFIRM = function(){
  let param = {
                I_LGNUM : 'Z01',I_TANUM:'2000178282',
                T_LTAP_CONF : [{ TANUM:"2000178282", TAPOS:"0001", SQUIT:"X"}],
                I_UPDATE_TASK:"X"
              }
  return invokeBAPI("L_TO_CONFIRM",param);
}

var test_BAPI_TRANSACTION_COMMIT = function(){
  let param = {WAIT:'X'};
  return invokeBAPI("BAPI_TRANSACTION_COMMIT",param);
}

var test_BAPI_TRANSACTION_COMMIT = function(){
  let param = {WAIT:'X'};
  return invokeBAPI("BAPI_TRANSACTION_COMMIT",param);
}

var invokeBAPI = function(BAPI,param){
  r3connect.Pool.get(configuration).acquire()
  .then(function (client) {
    // Actually call the back-end
    return client.invoke(BAPI, param);
  })
  .then(function (response) {
    // Output response
        console.log(JSON.stringify(response,null,2));
        r3connect.Pool.remove(configuration);
  })
  .catch(function (error) {
    // Output error
      console.error('Error invoking BAPI_DELIVERY_GETLIST:', error);
      r3connect.Pool.remove(configuration);
  });
}  

// test_BAPI_DELIVERY_GETLIST();
// test_BAPI_GOODSMVT_CREATE();
// test_BAPI_GOODSMVT_CANCEL();
// test_BAPI_HU_CREATE();
// test_BAPI_HU_DELETE_FROM_DEL();
// test_L_TO_CANCEL();
// test_L_TO_CONFIRM();
// test_BAPI_OUTB_DELIVERY_CONFIRM_DEC();
test_BAPI_PO_GETDETAIL();
// test_BAPI_RESERVATION_GETDETAIL();
// test_BAPI_CUSTOMER_GETDETAIL2();
// test_BAPI_WHSE_TO_GET_DETAIL();
// test_Z_WS_DELIVERY_UPDATE();
// test_Z_WS_REVERSE_GOODS_ISSUE();
// test_L_TO_CONFIRM();
// test_BAPI_TRANSACTION_COMMIT();
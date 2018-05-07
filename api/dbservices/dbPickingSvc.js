'use strict';
const sqlSvc=require("./sqlService");
const dbSvc=require("./dbCommonSvc");

//insert TO into SAP_TOHeader and SAP_TODetail in BX
  exports.InsertOrUpdateTO=function(info){
    var params={
      TransferOrder:{type:"sql.VarChar(12)",value:info.TransferOrder},
      Warehouse:{type:"sql.VarChar(6)",value:info.Warehouse},
      TOCreationDate:{type:'sql.VarChar(10)',value:info.TOCreationDate},
      TOCreationUser:{type:'sql.VarChar(20)',value:info.TOCreationUser},
      DONumber:{type:'sql.VarChar(12)',value:info.DONumber},
      Plant:{type:'sql.VarChar(4)',value:info.Plant},
      ShipToCustomer:{type:'sql.VarChar(8)',value:info.ShipToCustomer},
      PickConfirmStatus:{type:'sql.Char(1)',value:info.PickConfirmStatus},
      TOItemNumberList:{type:'sql.VarChar(3500)',value:info.TOItemNumberList},
      MaterialCodeList:{type:'sql.VarChar(8000)',value:info.MaterialCodeList},
      BatchNumberList:{type:'sql.VarChar(5500)',value:info.BatchNumberList},
      VendorBatchList:{type:'sql.VarChar(8000)',value:info.VendorBatchList},
      TOQuantityList:{type:'sql.VarChar(2000)',value:info.TOQuantityList}
    }
    return sqlSvc.callStoredProcedure("dbo.BX_InsertOrUpdateTO",params)
  }
  



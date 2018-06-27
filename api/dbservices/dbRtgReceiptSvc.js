'use strict';
const sqlSvc=require("./sqlService");
const dbSvc=require("./dbCommonSvc");

//when retrieving the DO from SAP, initialze the BX db
exports.InsertScanItem=function(info){
  var params={
    DONumber:{type:'sql.VarChar(12)',value:info.DONumber},
    EANCode:{type:'sql.VarChar(16)',value:info.EANCode},
    MaterialCode:{type:'sql.VarChar(18)',value:info.MaterialCode},
    BatchNo:{type:'sql.VarChar(20)',value:info.BatchNo},
    ReceiptBy:{type:'sql.VarChar(20)',value:info.ReceiptBy},
    ReceivedOn:{type:'sql.VarChar(10)',value:info.ReceivedOn},
    FullScanCode:{type:'sql.VarChar(60)',value:info.FullScanCode},
    Status:{type:'sql.Char(1)',value:info.Status},
    Qty:{type:'sql.Int',value:info.Qty}
  }
  if (info.SerialNo){
    params.SerialNo={type:'sql.VarChar(10)',value:info.SerialNo};
  }
  return sqlSvc.callStoredProcedure("dbo.BX_InsertOrUpdateRga",params)
}

//insert DO into SAP_DOHeader and SAP_DODetail in BX
  exports.InsertOrUpdateDO=function(info){
    var params={
      DONumber:{type:"sql.VarChar(12)",value:info.DONumber},
      DOCreationDate:{type:'sql.VarChar(10)',value:info.DOCreationDate},
      DOCreationUser:{type:'sql.VarChar(20)',value:info.DOCreationUser},
      Plant:{type:'sql.VarChar(4)',value:info.ShippingPoint},
      ShipToCustomer:{type:'sql.VarChar(8)',value:info.ShipToCustomer},
      DOStatus:{type:'sql.Char(1)',value:info.DOStatus},
      DOItemNumberList:{type:'sql.VarChar(3500)',value:info.DOItemNumberList},
      MaterialCodeList:{type:'sql.VarChar(8000)',value:info.MaterialCodeList},
      BatchNumberList:{type:'sql.VarChar(5500)',value:info.BatchNumberList},
      VendorBatchList:{type:'sql.VarChar(8000)',value:info.VendorBatchList},
      DOQuantityList:{type:'sql.VarChar(2000)',value:info.DOQuantityList}
    }
    return sqlSvc.callStoredProcedure("dbo.BX_RgaInsertOrUpdateDO",params)
  }

  //update quantity in BX_PackDetail --this is bad operation because user can update to more than planned qty
  exports.updateScanQty=function(info){
    var stmt = "update dbo.BX_RgaDetails SET ScanQty = @ScanQty WHERE DONumber=@DONumber and MaterialCode=@MaterialCode and BatchNo=@BatchNo and ReceiptBy=@ReceiptBy and ReceivedOn=@ReceivedOn and SerialNo is null";
    return sqlSvc.sqlQuery(stmt,getParamTypes(),info)
  }
  //Delete Rga detail item
  exports.deleteItem=function(info){
    var stmt=stmt = "delete from dbo.BX_RgaDetails WHERE DONumber=@DONumber and MaterialCode=@MaterialCode and BatchNo=@BatchNo and ReceiptBy=@ReceiptBy and ReceivedOn=@ReceivedOn and SerialNo";
    if (info.serialNo){
      stmt += "@SerialNo";
    } else {
      stmt += " is null";
    }
    return sqlSvc.sqlQuery(stmt,dbSvc.getParamTypes(),info)
  }
  //Delete Rga detail item
  exports.deleteItemByKey=function(RowKey){
    var stmt = "delete from dbo.BX_RgaDetails WHERE RowKey='"+RowKey+"'";
    return sqlSvc.sqlQuery(stmt)
  }

  //get scanned items for Rga
  exports.getScannedItems=function(DONumber){
    var stmt = "select * from dbo.BX_RgaDetails where DONumber=@DONumber";
    let paramTypes={DONumber:'sql.VarChar(12)'};
    let paramValues={DONumber:DONumber};
    return sqlSvc.sqlQuery(stmt,paramTypes,paramValues)
  }

  //get PackHUnits
  exports.getRgaDetails=function(DONumber){
    var stmt = "select * from dbo.BX_RgaDetails where DONumber=@DONumber";
    let paramTypes={DONumber:'sql.VarChar(12)'};
    let paramValues={DONumber:DONumber};
    return sqlSvc.sqlQuery(stmt,paramTypes,paramValues)
  }





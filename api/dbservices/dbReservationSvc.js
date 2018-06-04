'use strict';
const sqlSvc=require("./sqlService");
const dbSvc=require("./dbCommonSvc");

//insert Reversation into SAP_RESVHeader and SAP_RESVDetail in BX
  exports.InsertOrUpdateResv=function(info){
    var params={
      Warehouse:{type:"sql.VarChar(6)",value:info.Warehouse},
      ResvOrder:{type:"sql.VarChar(12)",value:info.ResvOrder},
      ResvOrderDate:{type:'sql.VarChar(10)',value:info.ResvOrderDate},
      ResvCreaedBy:{type:'sql.VarChar(20)',value:info.ResvCreaedBy},
      Plant:{type:'sql.VarChar(4)',value:info.Plant},
      PostingStatus:{type:'sql.Char(1)',value:info.PostingStatus},
      ResvItemNumberList:{type:'sql.VarChar(3500)',value:info.ResvItemNumberList},
      MaterialCodeList:{type:'sql.VarChar(8000)',value:info.MaterialCodeList},
      BatchNumberList:{type:'sql.VarChar(5500)',value:info.BatchNumberList},
      VendorBatchList:{type:'sql.VarChar(8000)',value:info.VendorBatchList},
      ResvQuantityList:{type:'sql.VarChar(2000)',value:info.ResvQuantityList}
    }
    return sqlSvc.callStoredProcedure("dbo.BX_InsertOrUpdateResv",params)
  }
  exports.InsertScanItem=function(info){
    var params={
      ResvNumber:{type:'sql.VarChar(12)',value:info.ResvNumber},
      EANCode:{type:'sql.VarChar(16)',value:info.EANCode},
      MaterialCode:{type:'sql.VarChar(18)',value:info.MaterialCode},
      BatchNo:{type:'sql.VarChar(20)',value:info.BatchNo},
      PostBy:{type:'sql.VarChar(20)',value:info.PostBy},
      PostOn:{type:'sql.VarChar(22)',value:info.PostOn},
      FullScanCode:{type:'sql.VarChar(60)',value:info.FullScanCode},
      Status:{type:'sql.Char(1)',value:info.Status},
      Qty:{type:'sql.Int',value:info.Qty}
    }
    if (info.SerialNo){
      params.SerialNo={type:'sql.VarChar(10)',value:info.SerialNo};
    }
    return sqlSvc.callStoredProcedure("dbo.BX_InsertOrUpdateResvDetails",params)
  }

  exports.deleteItemByKey=function(RowKey){
    var stmt = "delete from dbo.BX_ResvDetails WHERE RowKey='"+RowKey+"'";
    return sqlSvc.sqlQuery(stmt)
  }

  exports.getScannedItems=function(ResvNumber){
    var stmt = "select * from dbo.BX_ResvDetails where ResvNumber=@ResvNumber";
    let paramTypes={ResvNumber:'sql.VarChar(12)'};
    let paramValues={ResvNumber:ResvNumber};
    return sqlSvc.sqlQuery(stmt,paramTypes,paramValues)
  }

  exports.setStatus=function(info){
    var params={
      TONumber:{type:"sql.VarChar(12)",value:info.TONumber},
      PickConfirmStatus:{type:'sql.Char(1)',value:info.PickConfirmStatus},
      PickStart:{type:"sql.VarChar(22)",value:info.PickStart},
      PickComplete:{type:'sql.VarChar(22)',value:info.PickComplete},
      PickStatus:{type:'sql.Char(1)',value:info.PickStatus},
      Push2SAPStatus:{type:'sql.Char(1)',value:info.Push2SAPStatus},
      SAPRefNo:{type:"sql.VarChar(20)",value:info.SAPRefNo}
    }
    return sqlSvc.callStoredProcedure("dbo.BX_UpdateTOStatus",params)
  }
  



'use strict';
const sqlSvc=require("./sqlService");
const dbSvc=require("./dbCommonSvc");

  exports.InsertOrUpdateCountingWM=function(info){
    var params={
      docNo:{type:"sql.VarChar(12)",value:info.docNo},
      warehouse:{type:"sql.Char(3)",value:info.warehouse},
      itemNo:{type:"sql.Char(6)",value:info.itemNo},
      storageBinList:{type:'sql.VarChar(8000)',value:info.storageBinList},
      storageLocList:{type:'sql.VarChar(8000)',value:info.storageLocList},
      materialList:{type:'sql.VarChar(8000)',value:info.materialList},
      batchList:{type:'sql.VarChar(8000)',value:info.batchList},
      plantList:{type:'sql.VarChar(8000)',value:info.plantList}
    }
    return sqlSvc.callStoredProcedure("dbo.BX_InsertOrUpdateCountingWM",params)
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
      Warehouse:{type:"sql.VarChar(6)",value:info.Warehouse},
      ResvNumber:{type:"sql.VarChar(12)",value:info.ResvNumber},
      PostedOn:{type:"sql.VarChar(22)",value:info.PostedOn},
      PostedBy:{type:'sql.VarChar(30)',value:info.PostedBy},
      PostingStatus:{type:'sql.Char(1)',value:info.PostingStatus},
      Push2SAPStatus:{type:'sql.Char(1)',value:info.Push2SAPStatus},
      SAPRefNo:{type:"sql.VarChar(20)",value:info.SAPRefNo}
    }
    return sqlSvc.callStoredProcedure("dbo.BX_UpdateResvStatus",params)
  }
  



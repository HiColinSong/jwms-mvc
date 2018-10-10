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
  exports.InsertOrUpdateCountingIM=function(info){
    var params={
      docNo:{type:"sql.VarChar(12)",value:info.docNo},
      fiscalYear:{type:"sql.Char(4)",value:info.fiscalYear},
      itemNoList:{type:'sql.VarChar(8000)',value:info.itemNoList},
      materialList:{type:'sql.VarChar(8000)',value:info.materialList},
      batchList:{type:'sql.VarChar(8000)',value:info.batchList},
      plantList:{type:'sql.VarChar(8000)',value:info.plantList}
    }
    return sqlSvc.callStoredProcedure("dbo.BX_InsertOrUpdateCountingIM",params)
  }

  exports.InsertWmScanItem=function(info){
    var params={
      docNo:{type:"sql.VarChar(12)",value:info.docNo},
      warehouse:{type:"sql.Char(3)",value:info.warehouse},
      EANCode:{type:'sql.VarChar(16)',value:info.EANCode},
      MaterialCode:{type:'sql.VarChar(18)',value:info.MaterialCode},
      BatchNo:{type:'sql.VarChar(20)',value:info.BatchNo},
      countBy:{type:'sql.VarChar(20)',value:info.countBy},
      countOn:{type:'sql.VarChar(22)',value:info.countOn},
      FullScanCode:{type:'sql.VarChar(60)',value:info.FullScanCode},
      Qty:{type:'sql.Int',value:info.Qty}
    }
    if (info.SerialNo){
      params.SerialNo={type:'sql.VarChar(10)',value:info.SerialNo};
    }
    return sqlSvc.callStoredProcedure("dbo.BX_Scan_CountingWM",params)
  }

  exports.InsertImScanItem=function(info){
    var params={
      docNo:{type:"sql.VarChar(12)",value:info.docNo},
      fiscalYear:{type:"sql.Char(4)",value:info.fiscalYear},
      EANCode:{type:'sql.VarChar(16)',value:info.EANCode},
      MaterialCode:{type:'sql.VarChar(18)',value:info.MaterialCode},
      BatchNo:{type:'sql.VarChar(20)',value:info.BatchNo},
      countBy:{type:'sql.VarChar(20)',value:info.countBy},
      countOn:{type:'sql.VarChar(22)',value:info.countOn},
      FullScanCode:{type:'sql.VarChar(60)',value:info.FullScanCode},
      Qty:{type:'sql.Int',value:info.Qty}
    }
    if (info.SerialNo){
      params.SerialNo={type:'sql.VarChar(10)',value:info.SerialNo};
    }
    return sqlSvc.callStoredProcedure("dbo.BX_Scan_CountingIWM",params)
  }

  exports.deleteWMItemById=function(id){
    var stmt = "delete from dbo.BX_CountingWM_Scan WHERE id=@id";
    let paramTypes={id:'sql.Int'};
    let paramValues={id:id};
    return sqlSvc.sqlQuery(stmt,paramTypes,paramValues)
  }

  exports.deleteIMItemById=function(id){
    var stmt = "delete from dbo.BX_CountingIM_Scan WHERE id=@id";
    let paramTypes={id:'sql.Int'};
    let paramValues={id:id};
    return sqlSvc.sqlQuery(stmt,paramTypes,paramValues)
  }

  exports.getWMScannedItems=function(docNo,warehouse){
    var stmt = "SELECT s.id,c.id as countingWmId,c.docNo,c.warehouse,c.itemNo,c.storageBin,c.storageLoc,c.material as MaterialCode,c.batch as BatchNo,c.plant,s.qty as ScanQty,s.fullScanCode,s.serialNo,s.countBy,s.countOn from dbo.BX_CountingWM c, dbo.BX_CountingWM_Scan s  WHERE c.docNo = @docNo and c.warehouse = @warehouse AND c.id=s.countingWmId";
    let paramTypes={docNo:'sql.VarChar(12)', warehouse:'sql.Char(3)'};
    let paramValues={docNo:docNo,warehouse:warehouse};
    return sqlSvc.sqlQuery(stmt,paramTypes,paramValues)
  }

  exports.getIMScannedItems=function(docNo,fiscalYear){
    var stmt = "SELECT s.id,c.id as countingImId,c.docNo,c.fiscalYear,c.itemNo,c.MaterialCode,c.BatchNo,c.plant,s.qty as ScanQty,s.fullScanCode,s.serialNo,s.countBy,s.countOn from dbo.BX_CountingIM c, dbo.BX_CountingIM_Scan s  WHERE c.docNo = @docNo and c.fiscalYear = @fiscalYear AND c.id=s.countingWmId";
    let paramTypes={docNo:'sql.VarChar(12)', fiscalYear:'sql.Char(4)'};
    let paramValues={docNo:docNo,fiscalYear:fiscalYear};
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
  



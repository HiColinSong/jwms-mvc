'use strict';
const sqlSvc=require("./sqlService");

  exports.InsertOrUpdateCountingWM=function(info){
    var params={
      docNo:{type:"sql.VarChar(12)",value:info.docNo},
      verNo:{type:"sql.Char(2)",value:info.verNo},
      warehouse:{type:"sql.Char(3)",value:info.warehouse},
      storageBinList:{type:'sql.VarChar(8000)',value:info.storageBinList},
      materialList:{type:'sql.VarChar(8000)',value:info.materialList},
      batchList:{type:'sql.VarChar(8000)',value:info.batchList}
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
      isDeletedList:{type:'sql.VarChar(400)',value:info.isDeletedList}
    }
    return sqlSvc.callStoredProcedure("dbo.BX_InsertOrUpdateCountingIM",params)
  }

  exports.InsertWmScanItem=function(info){
    var params={
      docNo:{type:"sql.VarChar(12)",value:info.docNo},
      verNo:{type:"sql.Char(2)",value:info.verNo},
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
    return sqlSvc.callStoredProcedure("dbo.BX_Scan_CountingIM",params)
  }

  // exports.getWMScannedItems=function(docNo,warehouse){
  //   var stmt = "SELECT s.id,c.id as countingWmId,c.docNo,c.warehouse,c.storageBin,c.material as MaterialCode,c.batch as BatchNo,s.qty as ScanQty,s.fullScanCode,s.serialNo,s.countBy,s.countOn from dbo.BX_CountingWM c, dbo.BX_CountingWM_Scan s  WHERE c.docNo = @docNo and c.warehouse = @warehouse AND c.id=s.countingWmId";
  //   let paramTypes={docNo:'sql.VarChar(12)', warehouse:'sql.Char(3)'};
  //   let paramValues={docNo:docNo,warehouse:warehouse};
  //   return sqlSvc.sqlQuery(stmt,paramTypes,paramValues)
  // }

  // exports.getWMExtraItems=function(docNo,warehouse){
  //   var stmt = "SELECT id,docNo,warehouse,material as MaterialCode,batch as BatchNo FROM dbo.BX_CountingWM WHERE docNo = @docNo AND warehouse=@warehouse AND storageBin IS NULL";
  //   let paramTypes={docNo:'sql.VarChar(12)', warehouse:'sql.Char(3)'};
  //   let paramValues={docNo:docNo,warehouse:warehouse};
  //   return sqlSvc.sqlQuery(stmt,paramTypes,paramValues)
  // }

  // exports.getIMScannedItems=function(docNo,fiscalYear){
  //   var stmt = "SELECT s.id,c.id as countingImId,c.docNo,c.fiscalYear,c.itemNo,c.MaterialCode,c.BatchNo,s.qty as ScanQty,s.fullScanCode,s.serialNo,s.countBy,s.countOn from dbo.BX_CountingIM c, dbo.BX_CountingIM_Scan s  WHERE c.docNo = @docNo and c.fiscalYear = @fiscalYear AND c.id=s.countingImId";
  //   let paramTypes={docNo:'sql.VarChar(12)', fiscalYear:'sql.Char(4)'};
  //   let paramValues={docNo:docNo,fiscalYear:fiscalYear};
  //   return sqlSvc.sqlQuery(stmt,paramTypes,paramValues)
  // }
  exports.getIMExtraItems=function(docNo,fiscalYear){
    var stmt = "SELECT id,docNo,fiscalYear,MaterialCode,BatchNo FROM dbo.BX_CountingIM WHERE  docNo = @docNo AND fiscalYear=@fiscalYear AND itemNo IS NULL";
    let paramTypes={docNo:'sql.VarChar(12)', fiscalYear:'sql.Char(4)'};
    let paramValues={docNo:docNo,fiscalYear:fiscalYear};
    return sqlSvc.sqlQuery(stmt,paramTypes,paramValues)
  }

  exports.getWMEntryCount=function(docNo,verNo,warehouse){
    var params={
      docNo:{type:"sql.VarChar(12)",value:docNo},
      verNo:{type:"sql.Char(2)",value:verNo},
      warehouse:{type:"sql.Char(3)",value:warehouse}
    }
    return sqlSvc.callStoredProcedure("dbo.BX_GetWMEntryCount",params)
  }
  exports.getIMEntryCount=function(docNo,fiscalYear){
    var params={
      docNo:{type:"sql.VarChar(12)",value:docNo},
      fiscalYear:{type:"sql.Char(4)",value:fiscalYear}
    }
    return sqlSvc.callStoredProcedure("dbo.BX_GetIMEntryCount",params)
  }
  exports.CountingIMRefreshCounts=function(docNo,fiscalYear){
    var params={
      docNo:{type:"sql.VarChar(12)",value:docNo},
      fiscalYear:{type:"sql.Char(4)",value:fiscalYear}
    }
    return sqlSvc.callStoredProcedure("dbo.BX_CountingIMRefreshCounts",params)
  }
  exports.CountingWMRefreshCounts=function(docNo,verNo,warehouse){
    var params={
      docNo:{type:"sql.VarChar(12)",value:docNo},
      verNo:{type:"sql.Char(2)",value:verNo},
      warehouse:{type:"sql.Char(3)",value:warehouse}
    }
    return sqlSvc.callStoredProcedure("dbo.BX_CountingWMRefreshCounts",params)
  }
  exports.deleteIMItemById=function(docNo,fiscalYear,id){
    var params={
      docNo:{type:"sql.VarChar(12)",value:docNo},
      fiscalYear:{type:"sql.Char(4)",value:fiscalYear},
      id:{type:"sql.Int",value:id}
    }
    return sqlSvc.callStoredProcedure("dbo.BX_CountingIMRemoveItem",params)    
  }

  exports.deleteWMItemById=function(docNo,verNo,warehouse,id){
    var params={
      docNo:{type:"sql.VarChar(12)",value:docNo},
      verNo:{type:"sql.Char(2)",value:verNo},
      warehouse:{type:"sql.Char(3)",value:warehouse},
      id:{type:"sql.Int",value:id}
    }
    return sqlSvc.callStoredProcedure("dbo.BX_CountingWMRemoveItem",params)   
  }

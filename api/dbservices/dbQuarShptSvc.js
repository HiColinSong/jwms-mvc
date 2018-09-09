'use strict';

const sqlSvc=require("./sqlService");

  exports.getSubconOrders=function(){
    return sqlSvc.callStoredProcedure("dbo.BX_SPGetSubconOrders");
  }

  exports.getQuarShptPlan=function(subconPONo){
    var params;
    if (subconPONo&&subconPONo.length>20){
      params={
        sFullScanCode:{type:'sql.VarChar(60)',value:subconPONo}
      }
    } else {
      params={
        sSubCOnPORefNo:{type:'sql.VarChar(20)',value:subconPONo}
      }
    }
    return sqlSvc.callStoredProcedure("dbo.BX_GetQuarShptPlan",params);
  }
  
  exports.saveQuarShptPlan=function(info){
    var params={
      qsNo:{type:'sql.VarChar(22)',value:info.qsNo},
      SubconPORefNo:{type:'sql.VarChar(20)',value:info.subconPORefNo},
      planOn:{type:"sql.VarChar(20)",value:info.planOn},
      planBy:{type:"sql.VarChar(20)",value:info.planBy},
      workorderList:{type:'sql.VarChar(8000)',value:info.workorderList},
      batchNoList:{type:'sql.VarChar(5500)',value:info.batchNoList},
      qtyList:{type:'sql.VarChar(2000)',value:info.qtyList}
    }
    return sqlSvc.callStoredProcedure("dbo.BX_InserOrUpdateQuarShptPlan",params);
  }
  

 
  exports.updateSubConReturns=function(args){
    var params={
      sFullScanCode:{type:'sql.VarChar(60)',value:args.sFullScanCode},
      sReturnToTarget:{type:'sql.VarChar(3)',value:args.sReturnToTarget},
      sLogonUser:{type:'sql.VarChar(20)',value:args.sLogonUser},
      sQACategory:{type:'sql.VarChar(12)',value:args.sQACategory},
      dCurrDate:{type:'sql.DateTime',value:new Date()}
      // dCurrDate:{type:'sql.DateTime',value:args.dCurrDate}
    }
      if (args.sOverWritePreviousScan){
        params.sOverWritePreviousScan={type:'sql.VarChar(1)',value:args.sOverWritePreviousScan};
      }
      return sqlSvc.callStoredProcedure("dbo.SPUpdateSubConReturns",params);
  }

  //insert Handlig Units list
  exports.createHandlingUnits=function(info){
    if (info.Domain=='BESA'){
      info.Domain='BBV'
    }
    var params={
      qsNo:{type:"sql.VarChar(22)",value:info.qsNo},
      NumToCreate:{type:'sql.Int',value:info.NumToCreate},
      PackMaterial:{type:'sql.VarChar(18)',value:info.PackMaterial},
      CreatedBy:{type:'sql.VarChar(20)',value:info.CreatedBy},
      BUnit:{type:'sql.VarChar(10)',value:info.Domain},
      CreatedOn:{type:'sql.VarChar(22)',value:info.CreatedOn}
    }
    return sqlSvc.callStoredProcedure("dbo.BX_InsertPrepackHandlingUnits",params)
  }

    //Delete a Handling Unit
    exports.deleteHandlingUnit=function(info){
      var params={
        qsNo:{type:"sql.VarChar(22)",value:info.qsNo},
        HUNumber:{type:'sql.VarChar(20)',value:info.HUNumber}
      }
      return sqlSvc.callStoredProcedure("dbo.BX_DeletePrepackHandlingUnit",params)
    }

    exports.getPrepackDetails=function(qsNo){
      var stmt = "select s.SerialNo,s.workorder,s.HUNumber,s.FullScanCode,w.batchno as BatchNo,w.Itemcode as MaterialCode from dbo.BX_SubconShipments s,dbo.WorkOrders w where s.workorder=w.Project and qsNO=@qsNo";
      let paramTypes={qsNo:'sql.VarChar(22)'};
      let paramValues={qsNo:qsNo};
      return sqlSvc.sqlQuery(stmt,paramTypes,paramValues)
    }

  exports.getPrepackHUnits=function(qsNo){
    var stmt = "select * from dbo.BX_QuarShpt_PrepackHUnits where qsNo=@qsNo";
    let paramTypes={qsNo:'sql.VarChar(22)'};
    let paramValues={qsNo:qsNo};
    return sqlSvc.sqlQuery(stmt,paramTypes,paramValues)
  }

  //when retrieving the DO from SAP, initialze the BX db
exports.prepackScanItem=function(info){
  let params
  if (info.serialNo){ //UDI Scan
      params={
      qsNo:{type:'sql.VarChar(12)',value:info.DONumber},
      HUNumber:{type:'sql.VarChar(20)',value:info.HUNumber},
      batchNo:{type:'sql.VarChar(18)',value:info.batchNo},
      sFullScanCode:{type:'sql.VarChar(60)',value:info.sFullScanCode},
      ModifiedBy:{type:'sql.VarChar(20)',value:info.PackBy},
      ModifiedOn:{type:'sql.VarChar(22)',value:info.PackedOn},
    }
    return sqlSvc.callStoredProcedure("dbo.BX_PrepackScanItem",params)
  } else { //Non UDI Scan
        params={
        subConPo:{type:'sql.VarChar(20)',value:info.subConPo},
        qsNo:{type:'sql.VarChar(22)',value:info.DONumber},
        HUNumber:{type:'sql.VarChar(20)',value:info.HUNumber},
        batchNo:{type:'sql.VarChar(18)',value:info.batchNo},
        sFullScanCode:{type:'sql.VarChar(60)',value:info.sFullScanCode},
        ModifiedBy:{type:'sql.VarChar(20)',value:info.PackBy},
        ModifiedOn:{type:'sql.VarChar(22)',value:info.PackedOn},
        sQty:{type:'sql.Int',value:info.sQty}
      }
      return sqlSvc.callStoredProcedure("dbo.BX_PrepackScanItemByBatch",params)
  }
}
exports.removePrepackScanItem=function(FullScanCode){
  var stmt = "Update dbo.BX_SubconShipments SET StatusID=5,qsNo=NULL,HUNumber=NULL,ReceivedOn=NULL WHERE FullScanCode=@FullScanCode";
  let paramTypes={FullScanCode:'sql.VarChar(60)'};
  let paramValues={FullScanCode:FullScanCode};
  return sqlSvc.sqlQuery(stmt,paramTypes,paramValues)
}
exports.getHuAndPrepackDetails=function(qsNo){
  var params={
    qsNo:{type:"sql.VarChar(22)",value:qsNo}
  }
  return sqlSvc.callStoredProcedure("dbo.BX_GetPrepackHandlingUnitAndScannedItems",params)
}
exports.updateQuarShptStatus=function(info){
  var params={
    qsNo:{type:"sql.VarChar(22)",value:info.qsNo},
    SubconPORefNo:{type:"sql.VarChar(20)",value:info.SubconPORefNo},
    planBy:{type:"sql.VarChar(22)",value:info.planBy},
    planOn:{type:"sql.VarChar(22)",value:info.planOn},
    linkedDONumber:{type:"sql.VarChar(12)",value:info.linkedDONumber},
    prepackConfirmOn:{type:"sql.VarChar(22)",value:info.prepackConfirmOn}
  }
  return sqlSvc.callStoredProcedure("dbo.BX_UpdateQuarShptStatus",params)
}
exports.linkPrepackToPack=function(info){
  var params={
    qsNo:{type:"sql.VarChar(22)",value:info.qsNo},
    DONumber:{type:"sql.VarChar(12)",value:info.DONumber},
    workorderList:{type:"sql.VarChar(8000)",value:info.workorderList},
    DOItemNumberList:{type:"sql.VarChar(8000)",value:info.DOItemNumberList}
  }
  return sqlSvc.callStoredProcedure("dbo.BX_LinkPrepackToPack",params)
}

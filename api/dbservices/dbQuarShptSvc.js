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


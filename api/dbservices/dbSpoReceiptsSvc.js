'use strict';

const sqlSvc=require("./sqlService");

  exports.getSubconOrders=function(){
    return sqlSvc.callStoredProcedure("dbo.BX_SPGetSubconOrders");
  }

  exports.getSubconWorkOrders=function(subconPONo){
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
    return sqlSvc.callStoredProcedure("dbo.BX_SPGetSubconWorkOrders",params);
  }
  
  exports.getLotReleaseTable=function(subconPONo){
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
    return sqlSvc.callStoredProcedure("dbo.BX_GetLotReleaseTable",params);
  }


  exports.CheckAndCompleteWorkordersReceipt=function(params){
    var params={
        sSubCOnPORefNo:{type:'sql.VarChar(20)',value:params.sSubCOnPORefNo},
        workOrderList:{type:'sql.VarChar(8000)',value:params.workOrderList},
        confirmOn:{type:'sql.VarChar(20)',value:params.confirmOn},
        confirmBy:{type:'sql.VarChar(8000)',value:params.confirmBy}
    }

    return sqlSvc.callStoredProcedure("dbo.BX_CheckAndCompleteWorkordersReceipt",params);
  }
  
  //get getQASampleCategoryList
  exports.getQASampleCategoryList=function(){
    var stmt = "select QASampleID,QASampleDesc from dbo.BX_QASampleCategory";
    return sqlSvc.sqlQuery(stmt);
  }

  exports.getSubconPendingList=function(orderNo,shipTotarget){
    var params={
      sSubCOnPORefNo:{type:'sql.VarChar(20)',value:orderNo},
      sShip2Target:{type:'sql.VarChar(3)',value:shipTotarget}
    }
    return sqlSvc.callStoredProcedure("dbo.SpGetPendingReceiptsSerialsBySubconOrder",params);
  }

  exports.getSubconReceiveList=function(orderNo,shipTotarget){
    var params={
      sSubCOnPORefNo:{type:'sql.VarChar(20)',value:orderNo},
      sShip2Target:{type:'sql.VarChar(3)',value:shipTotarget}
    }
    return sqlSvc.callStoredProcedure("dbo.SpGetReceivedSerialsBySubconOrder",params);
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


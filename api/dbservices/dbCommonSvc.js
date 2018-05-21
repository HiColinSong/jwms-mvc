'use strict';

const sqlSvc=require("./sqlService");
  exports.getMaterialCode=function(EANCode){
    var stmt = "select MaterialCode from dbo.SAP_EANCodes where EANCode=@EANCode";
    let paramTypes={EANCode:'sql.VarChar(20)'};
    let paramValues={EANCode:EANCode};
    return sqlSvc.sqlQuery(stmt,paramTypes,paramValues)
  }
  //get getPkgMtlList
  exports.getPkgMtlList=function(){
    var stmt = "select MaterialCode,MaterialDesc from dbo.SAPPkgMaterials";
    return sqlSvc.sqlQuery(stmt);
  }
  //get getQASampleCategoryList
  exports.getQASampleCategoryList=function(){
    var stmt = "select QASampleID,QASampleDesc from dbo.BX_QASampleCategory";
    return sqlSvc.sqlQuery(stmt);
  }

  //user profile
  exports.getUserProfile=function(userId){
    var stmt = "select * from dbo.BX_UserProfile where UserID=@UserID";
    let paramTypes={UserID:'sql.VarChar(20)'};
    let paramValues={UserID:userId};
    return sqlSvc.sqlQuery(stmt,paramTypes,paramValues)
  }

  //user profile
  exports.deleteUserProfile=function(userId){
    var stmt = "delete from dbo.BX_UserProfile where UserID=@UserID";
    let paramTypes={UserID:'sql.VarChar(20)'};
    let paramValues={UserID:userId};
    return sqlSvc.sqlQuery(stmt,paramTypes,paramValues)
  }

  //user profile
  exports.getSubconPendingList=function(args){
    var stmt = "select * from dbo.BX_SubconShipments where shipToTarget=@sShip2Target";
    let paramTypes={sShip2Target:'sql.VarChar(3)'};
    let paramValues={sShip2Target:args.sShip2Target};
    return sqlSvc.sqlQuery(stmt,paramTypes,paramValues)
  }
 
  // exports.getSubconPendingList=function(args){
  //   var stmt = "select * from dbo.BX_SubconShipments where shipToTarget=@sShip2Target";
  //   let paramTypes={sShip2Target:'sql.VarChar(3)'};
  //   let paramValues={sShip2Target:args.sShip2Target};
  //   return sqlSvc.sqlQuery(stmt,paramTypes,paramValues)
  // }
  exports.getSubconPendingList=function(shipTotarget){
    var params={
      sShip2Target:{type:'sql.VarChar(3)',value:shipTotarget}
    }
    return sqlSvc.callStoredProcedure("dbo.SpGetPendingReceiptsSerials",params);
  }
  //update insertOrUpdateUserProfile 
  exports.insertOrUpdateUserProfile=function(user){
    var params={
      UserID:{type:'sql.VarChar(20)',value:user.UserID},
      DefaultWH:{type:'sql.VarChar(3)',value:user.DefaultWH},
      Domain:{type:'sql.VarChar(20)',value:user.Domain},
      UserRole:{type:'sql.VarChar(20)',value:user.UserRole},
      isActive:{type:'sql.Char(1)',value:user.isActive}
    }
    return sqlSvc.callStoredProcedure("dbo.BX_InsertOrUpdateUserProfile",params);
  }
  //update DO status
  exports.UpdateDOStatus=function(info){
    var params={
      DONumber:{type:'sql.VarChar(12)',value:info.DONumber},
    }
    if (info.DOStatus)
      params.DOStatus={type:'sql.Char(1)',value:info.DOStatus};
    if (info.PackStart)
      params.PackStart={type:'sql.VarChar(10)',value:info.PackStart};
    if (info.PackComplete)
      params.PackComplete={type:'sql.VarChar(10)',value:info.PackComplete};
    if (info.PackStatus||infoPackStatus===0)
      params.PackStatus={type:'sql.Char(1)',value:info.PackStatus};
    if (info.Push2SAPStatus)
      params.Push2SAPStatus={type:'sql.Char(1)',value:info.Push2SAPStatus};
    if (info.SAPRefNo)
      params.SAPRefNo={type:'sql.NVarChar(20)',value:info.SAPRefNo};

      return sqlSvc.callStoredProcedure("dbo.BX_UpdateDOStatus",params);
  }
  //update TO status
  exports.UpdateTOStatus=function(info){
    var params={
      TONumber:{type:'sql.VarChar(12)',value:info.TONumber},
    }
    if (info.PickConfirmStatus)
      params.PickConfirmStatus={type:'sql.Char(1)',value:info.PickConfirmStatus};
    if (info.PickStart)
      params.PickStart={type:'sql.VarChar(10)',value:info.PickStart};
    if (info.PickComplete)
      params.PickComplete={type:'sql.VarChar(10)',value:info.PickComplete};
    if (info.PickStatus)
      params.PickStatus={type:'sql.Char(1)',value:info.PickStatus};
    if (info.Push2SAPStatus)
      params.Push2SAPStatus={type:'sql.Char(1)',value:info.Push2SAPStatus};
    if (info.SAPRefNo)
      params.SAPRefNo={type:'sql.NVarChar(20)',value:info.SAPRefNo};

      return sqlSvc.callStoredProcedure("dbo.BX_UpdateTOStatus",params);
  }
  //check TOs status
  exports.CheckMultipleTOStatus=function(TONumberList){
    var params={
      TONumberList:{type:'sql.VarChar(1200)',value:TONumberList.join(',')},
    }
      return sqlSvc.callStoredProcedure("dbo.BX_CheckMultipleTOStatus",params);
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
      return sqlSvc.callStoredProcedure("dbo.SPUpdateSubConReturns",params);
  }

  exports.getParamTypes = function(){
    let paramTypes={ScanQty:'sql.Int'};
    paramTypes.DONumber='sql.VarChar(12)';
    paramTypes.HUNumber='sql.VarChar(20)';
    paramTypes.MaterialCode='sql.VarChar(18)';
    paramTypes.SerialNo='sql.VarChar(8)';
    paramTypes.BatchNo='sql.VarChar(20)';
    paramTypes.PackBy='sql.VarChar(20)';
    paramTypes.PackedOn='sql.VarChar(20)';
    return paramTypes;
  }


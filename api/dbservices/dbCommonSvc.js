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
  //update user profile
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


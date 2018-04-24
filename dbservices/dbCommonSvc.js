'use strict';

const sqlSvc=require("./sqlService");
  exports.getMaterialCode=function(EANCode){
    var stmt = "select MaterialCode from dbo.SAP_EANCodes where EANCode=@EANCode";
    let paramTypes={EANCode:'sql.VarChar(20)'};
    let paramValues={EANCode:EANCode};
    return sqlSvc.sqlQuery(stmt,paramTypes,paramValues)
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


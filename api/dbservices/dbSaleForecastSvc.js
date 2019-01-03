'use strict';

const sqlSvc=require("./sqlService");

  //get user List
  exports.getSaleForecastList=function(domain){
    var stmt = "select * from dbo.V_BOSDocument_SaleForecast";
    // var stmt = "select * from dbo.UserProfile where DOMAIN=@DOMAIN";
    let paramTypes={};
    let paramValues={};
    return sqlSvc.sqlK3Query(stmt,paramTypes,paramValues);
  }
//   exports.insertOrUpdateSaleForecastProfile=function(user){
//     var params={
//       ID:{type:'sql.Int',value:user.ID},
//       HospName:{type:'sql.VarChar(50)',value:user.HospName},
//       Saler:{type:'sql.VarChar(30)',value:user.Saler},
//       LeiBei:{type:'sql.VarChar(20)',value:user.LeiBei},
//       YearMonth:{type:'sql.VarChar(20)',value:user.YearMonth},
//       ForecastPrice:{type:'sql.Decimal(18,2)',value:user.ForecastPrice},
//       ForecastQty:{type:'sql.Decimal(18,2)',value:user.ForecastQty},
//       Remark:{type:'sql.VarChar(100)',value:user.Remark},
//       userName:{type:'sql.VarChar(20)',value:user.userName},
//     }
//     return sqlSvc.callStoredProcedure("dbo.JM_InsertOrUpdateSaleForecastProfile",params);
//   }

  exports.deleteSaleForecastProfile=function(FID){
    var stmt = "delete from dbo.t_BOSDocument where fid=@fid";
    let paramTypes={fid:'sql.Int'};
    let paramValues={fid:FID};
    return sqlSvc.sqlK3Query(stmt,paramTypes,paramValues);
  }

  exports.insertOrUpdateSaleForecastProfile=function(saleForecast){
    //stmt will be something 4like: "exec JM_InsertOrUpdateUserProfile 'yd.zhu','朱亚东','BITSG','admin','1'"
    let stmt=["exec JM_InsertOrUpdateSaleForecastProfile"];
    var Year;
    // Year = saleForecast.Date.substring(0,4);
    // var Month;
    // if(saleForecast.Date.indexOf("年")>-1){
    //   if(saleForecast.Date.length==8){
    //     Month = saleForecast.Date.substring(5,7);
    //   } else {
    //     Month = saleForecast.Date.substring(5,6);
    //   }
    // } else {
    //   if(saleForecast.Date.substring(5,6) == 0){
    //     Month = saleForecast.Date.substring(6,7);
    //   } else {
    //     Month = saleForecast.Date.substring(5,7);
    //   }
    // }
    if(saleForecast.FID == undefined){
      saleForecast.FID = -1;
    }
    if(saleForecast.Fnote == undefined){
      saleForecast.Fnote = '';
    }
    stmt.push(`${saleForecast.FID},`),
    stmt.push(`${saleForecast.Year},`),
    stmt.push(`${saleForecast.Month},`),
    stmt.push(`'${saleForecast.FHospName}',`),    
    stmt.push(`'${saleForecast.ProductTypeName}',`),  
    stmt.push(`'${saleForecast.FEmpName}',`),
    stmt.push(`${saleForecast.Aprice},`),
    stmt.push(`${saleForecast.Aamout},`),
    stmt.push(`'${saleForecast.Fnote}'`)
    return sqlSvc.sqlK3Query(stmt.join(" "))
  }

  exports.getProductTypeList=function(domain){
    var stmt = "select FName from t_SubMessage where FTypeID = 10008";
    let paramTypes={};
    let paramValues={};
    return sqlSvc.sqlK3Query(stmt,paramTypes,paramValues);
  }

  exports.getAgentList=function(domain){
    var stmt = "select FName from t_Organization where FNumber not LIKE '%[ABCDEFGHIJKLMNOPQRSTUVWXYZ]%'";
    let paramTypes={};
    let paramValues={};
    return sqlSvc.sqlK3Query(stmt,paramTypes,paramValues);
  }

  exports.getHospitalList=function(domain){
    var stmt = "select FName from t_Organization where FNumber LIKE '%[ABCDEFGHIJKLMNOPQRSTUVWXYZ]%'";
    let paramTypes={};
    let paramValues={};
    return sqlSvc.sqlK3Query(stmt,paramTypes,paramValues);
  }
  exports.getSalerList=function(domain){
    var stmt = "select FName,FItemID  FROM t_Emp Where ISNULL(F_102,'')<>'' AND FDeleted=0";
    let paramTypes={};
    let paramValues={};
    return sqlSvc.sqlK3Query(stmt,paramTypes,paramValues);
  }


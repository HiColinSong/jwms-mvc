'use strict';

const sqlSvc=require("./sqlService");

  //get user List
  exports.getSaleForecastList=function(dateStr,FHospName,ProductTypeName){
    var stmt = "select * from dbo.V_BOSDocument_SaleForecast where year = @year and month = @month";
    var date = new Date(dateStr);
    let paramTypes={year:'sql.Int',month:'sql.Int'};
    let paramValues={year:date.getFullYear(),month:date.getMonth()+1};
    if(FHospName != undefined && FHospName != "undefined"){
      stmt += " and FHospName = @FHospName";
      paramTypes["FHospName"] = 'sql.NVarChar(50)';
      paramValues["FHospName"] = FHospName;
    }
    if(ProductTypeName != undefined && ProductTypeName != "undefined"){
      stmt += " and ProductTypeName = @ProductTypeName";
      paramTypes["ProductTypeName"] = 'sql.NVarChar(50)';
      paramValues["ProductTypeName"] = ProductTypeName;
    }
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
    var Month;
    var date;
    if(saleForecast.Date.indexOf("年")>-1){
      let date_str = saleForecast.Date.replace(/年/g,"/");
      date_str = date_str.replace(/月/g,"");
      date = new Date(date_str);
    } else {
      date = new Date(saleForecast.Date);
    }
    Year = date.getFullYear();
    Month = date.getMonth()+1;
    if(saleForecast.FID == undefined){
      saleForecast.FID = -1;
    }
    if(saleForecast.Fnote == undefined){
      saleForecast.Fnote = '';
    }
    stmt.push(`${saleForecast.FID},`),
    stmt.push(`${Year},`),
    stmt.push(`${Month},`),
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


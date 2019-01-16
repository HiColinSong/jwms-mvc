'use strict';

const sqlSvc=require("./sqlService");
//get user List
exports.getPromotionDiscountList=function(dateStr,FHospName,ProductTypeName){
    var stmt = "select * from dbo.t_BOSDocument where ItemType =2 and year = @year and month = @month";
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



  exports.deletePromotionDiscount=function(FID){
    var stmt = "delete from dbo.t_BOSDocument where fid=@fid";
    let paramTypes={fid:'sql.Int'};
    let paramValues={fid:FID};
    return sqlSvc.sqlK3Query(stmt,paramTypes,paramValues);
  }

  exports.addPromotionDiscount=function(promotionDiscount){
    //stmt will be something 4like: "exec JM_InsertOrUpdateUserProfile 'yd.zhu','朱亚东','BITSG','admin','1'"
    let stmt=["exec JM_InsertOrUpdatePromotionDiscountProfile"];
    var Year;
    var Month;
    var date;
    if(promotionDiscount.Date.indexOf("年")>-1){
      let date_str = promotionDiscount.Date.replace(/年/g,"/");
      date_str = date_str.replace(/月/g,"");
      date = new Date(date_str);
    } else {
      date = new Date(promotionDiscount.Date);
    }
    Year = date.getFullYear();
    Month = date.getMonth()+1;
    if(promotionDiscount.FID == undefined){
      promotionDiscount.FID = -1;
    }
    stmt.push(`${promotionDiscount.FID},`),
    stmt.push(`${Year},`),
    stmt.push(`${Month},`),
    stmt.push(`'${promotionDiscount.FHospName}',`),
    stmt.push(`'${promotionDiscount.ProductTypeName}',`),
    stmt.push(`${promotionDiscount.Ssample},`),
    stmt.push(`${promotionDiscount.ODActivity},`),
    stmt.push(`'${promotionDiscount.Fnote}',`),
    stmt.push(`'${promotionDiscount.maintainerName}'`)
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
'use strict';

const sqlSvc=require("./sqlService");
//get user List
exports.getPromotionDiscountList=function(domain){
    var stmt = "select * from dbo.t_BOSDocument where ItemType =2";
    let paramTypes={};
    let paramValues={};
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
    Year = promotionDiscount.Date.substring(0,4);
    var Month;
    if(promotionDiscount.Date.indexOf("年")>-1){
      if(promotionDiscount.Date.length==8){
        Month = promotionDiscount.Date.substring(5,7);
      } else {
        Month = promotionDiscount.Date.substring(5,6);
      }
    } else {
      if(promotionDiscount.Date.substring(5,6) == 0){
        Month = promotionDiscount.Date.substring(6,7);
      } else {
        Month = promotionDiscount.Date.substring(5,7);
      }
    }
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
    stmt.push(`'${promotionDiscount.Fnote}'`)
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
'use strict';

const sqlSvc=require("./sqlService");
//get user List
exports.getBusinessPriceList=function(domain){
    var stmt = "select * from dbo.t_BOSDocument where ItemType =1";
    let paramTypes={};
    let paramValues={};
    return sqlSvc.sqlK3Query(stmt,paramTypes,paramValues);
  }



  exports.deleteBusinessPrice=function(FID){
    var stmt = "delete from dbo.t_BOSDocument where fid=@fid";
    let paramTypes={fid:'sql.Int'};
    let paramValues={fid:FID};
    return sqlSvc.sqlK3Query(stmt,paramTypes,paramValues);
  }

  exports.addBusinessPrice=function(businessPrice){
    //stmt will be something 4like: "exec JM_InsertOrUpdateUserProfile 'yd.zhu','朱亚东','BITSG','admin','1'"
    let stmt=["exec JM_InsertOrUpdateBusinessPriceProfile"];
    var Year;
    Year = businessPrice.Date.substring(0,4);
    var Month;
    if(businessPrice.Date.indexOf("年")>-1){
      if(businessPrice.Date.length==8){
        Month = businessPrice.Date.substring(5,7);
      } else {
        Month = businessPrice.Date.substring(5,6);
      }
    } else {
      if(businessPrice.Date.substring(5,6) == 0){
        Month = businessPrice.Date.substring(6,7);
      } else {
        Month = businessPrice.Date.substring(5,7);
      }
    }
    if(businessPrice.FID == undefined){
      businessPrice.FID = -1;
    }
    stmt.push(`${businessPrice.FID},`),
    stmt.push(`${Year},`),
    stmt.push(`${Month},`),
    stmt.push(`'${businessPrice.FHospName}',`),
    stmt.push(`'${businessPrice.DistributorName}',`),
    stmt.push(`'${businessPrice.ProductTypeName}',`),
    stmt.push(`${businessPrice.CSPrice},`),
    stmt.push(`${businessPrice.BARebate},`),
    stmt.push(`${businessPrice.TTBoot},`),
    stmt.push(`${businessPrice.Spromotion},`),
    stmt.push(`${businessPrice.BTBGift},`),
    stmt.push(`${businessPrice.BNHDAward},`),
    stmt.push(`'${businessPrice.Fnote}'`)
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
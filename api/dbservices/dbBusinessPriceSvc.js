'use strict';

const sqlSvc=require("./sqlService");
//get user List
exports.getBusinessPriceList=function(dateStr,FHospName,ProductTypeName){
    var stmt = "select * from dbo.t_BOSDocument where ItemType =1 and year = @year and month = @month";
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
    var Month;
    var date;
    if(businessPrice.Date.indexOf("年")>-1){
      let date_str = businessPrice.Date.replace(/年/g,"/");
      date_str = date_str.replace(/月/g,"");
      date = new Date(date_str);
    } else {
      date = new Date(businessPrice.Date);
    }
    Year = date.getFullYear();
    Month = date.getMonth()+1;
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
    stmt.push(`'${businessPrice.Fnote}',`),
    stmt.push(`'${businessPrice.maintainerName}'`)
    return sqlSvc.sqlK3Query(stmt.join(" "))
  }
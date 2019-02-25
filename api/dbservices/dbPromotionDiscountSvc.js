'use strict';

const sqlSvc=require("./sqlService");
//get user List
exports.getPromotionDiscountList=function(dateStr,FHospName,ProductTypeName){
    var stmt = "select * from dbo.t_BOSDocument  WHere ItemType=@Tmp";   
    let paramTypes={Tmp:'sql.Int'};
    let paramValues={Tmp:2};

    if(dateStr != undefined && dateStr != "undefined"){
      stmt += " and FDateFrom <= @FDate AND FDateTo>= @FDate";
      paramTypes["FDate"] = 'sql.NVarChar(50)';
      paramValues["FDate"] = dateStr;
    }
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
    // var Year;
    // var Month;
    // var date;
    // if(promotionDiscount.Date.indexOf("年")>-1){
    //   let date_str = promotionDiscount.Date.replace(/年/g,"/");
    //   date_str = date_str.replace(/月/g,"");
    //   date = new Date(date_str);
    // } else {
    //   date = new Date(promotionDiscount.Date);
    // }
    // Year = date.getFullYear();
    // Month = date.getMonth()+1;
    if(promotionDiscount.FID == undefined){
      promotionDiscount.FID = -1;
    }
    stmt.push(`${promotionDiscount.FID},`),
    stmt.push(`'${promotionDiscount.FDateFrom}',`),
    stmt.push(`'${promotionDiscount.FDateTo}',`),
    stmt.push(`'${promotionDiscount.FHospName}',`),
    stmt.push(`'${promotionDiscount.ProductTypeName}',`),
    stmt.push(`${promotionDiscount.Ssample},`),
    stmt.push(`${promotionDiscount.ODActivity},`),
    stmt.push(`'${promotionDiscount.Fnote}',`),
    stmt.push(`'${promotionDiscount.maintainerName}'`)
    return sqlSvc.sqlK3Query(stmt.join(" "))
  }


  exports.copyPromotionDiscount=function(promotionDiscount){
    let stmt=["exec JM_CopyPromotionDiscountProfile"];
    stmt.push(`'${promotionDiscount.ProductTypeName}',`),
    stmt.push(`${promotionDiscount.year},`),
    stmt.push(`${promotionDiscount.month},`),
    stmt.push(`${promotionDiscount.yearTarget},`),
    stmt.push(`${promotionDiscount.monthTarget},`),
    stmt.push(`'${promotionDiscount.maintainerName}'`)
    return sqlSvc.sqlK3Query(stmt.join(" "))
  }

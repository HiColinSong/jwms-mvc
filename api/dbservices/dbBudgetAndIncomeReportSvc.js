'use strict';

const sqlSvc=require("./sqlService");


exports.getBudgetAndIncomeData = function(date,FHospName,ProductTypeName){  
    //P_BudgetAndIncomeDetailQuery '2017','12'  ,'支架系统','hospName'  
    var date = new Date(date);
    var year =date.getFullYear();
    var month =date.getMonth()+1;
    var productTypeName="";
    var hospName="";
    if(FHospName != undefined && FHospName != "undefined"){
      hospName=FHospName;
    }
    if(ProductTypeName != undefined && ProductTypeName != "undefined"){
      productTypeName=ProductTypeName;
    }   
  
    let stmt = ["exec dbo.P_BudgetAndIncomeDetailQuery "];
   // stmt.push(`${saleForecast.FID},`),
    stmt.push(`${year},`);
    stmt.push(`${month},`);
    stmt.push(`'${productTypeName}',`);
    stmt.push(`'${hospName}'`);
    
    // stmt.push(month);
    // stmt.push(",");
    // stmt.push(productTypeName);
    // stmt.push(",");
    // stmt.push(hospName);   
   // stmt.push("");
    return sqlSvc.sqlK3Query(stmt.join(" "));
    /* var params={
      RoleId:{type:'sql.Int',value:1},
      PortalId:{type:'sql.Int',value:0}
    }
    return sqlSvc.callK3StoredProcedure("dbo.GetRole",params); */
  }
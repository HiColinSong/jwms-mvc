'use strict';

const sqlSvc=require("./sqlService");


exports.getBudgetAndIncomeData = function(date){
    /* date = date.substring(0,4);
    var params={
      FYEAR:{type:'sql.Int',value:2018},
      LB:{type:'sql.VarChar(20)',value:'支架系统'},
      Role:{type:'sql.VarChar(30)',value:'客服部'},
      UserType:{type:'sql.VarChar(50)',value:'不受限用户'},
      EmpID:{type:'sql.Int',value:9214}
    }
    return sqlSvc.callK3StoredProcedure("dbo.PROC_JWsaleYearQuery",params); */
    date = date.substring(0,4);  
    let stmt = ["exec dbo.P_BudgetAndIncomeDetailQuery "];
    stmt.push("2019")
    //stmt.push(date+",")
    // stmt.push("'支架系统',"),
    // stmt.push("'客服部',"),
    // stmt.push("'不受限用户',"),
    // stmt.push("9214")
    return sqlSvc.sqlK3Query(stmt.join(" "));
    /* var params={
      RoleId:{type:'sql.Int',value:1},
      PortalId:{type:'sql.Int',value:0}
    }
    return sqlSvc.callK3StoredProcedure("dbo.GetRole",params); */
  }
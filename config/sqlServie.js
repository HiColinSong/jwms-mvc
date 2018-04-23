'use strict';

var sql = require("mssql");
var Promise = require('Promise').default;
// config for your database
var config = {
    user: 'bxadmin',
    password: 'Bx@admin',
    server: 'sgdevbx', 
    database: 'BIOTRACK' 
};
var pool,request ;
var callStoredProcedure=function(spName,inputParams,outParams){
  return new Promise(function(resolve,reject){
      pool = new sql.ConnectionPool(config, err => {
        if (err){
          reject(err);
          pool.close();
        }
        request = pool.request();
          for (let key in inputParams) {
            request.input(key,eval(inputParams[key].type),inputParams[key].value);
          }
          if (outParams){
            for (let key in object) {
                request.output(key,eval(outParams[key].type));
            }
          }
         request.execute(spName,(err,result)=>{
           if (err){
             reject(err);
             pool.close();
           }
          //  console.dir(result)
           resolve(result);
           pool.close();
         });
    })
  })
}

var sqlQuery=function(queryStmt,paramTypes,paramValues){
  return new Promise(function(resolve,reject){
    var pool = new sql.ConnectionPool(config).connect(err=>{
        if (err){
            reject(err);
            pool.close();
        }
        const ps = new sql.PreparedStatement(pool)
        // ps.input('param', sql.Int)
        for (let key in paramTypes) {
          ps.input(key,eval(paramTypes[key]));
        }
        ps.prepare(queryStmt, err => {
            if(err){
              reject(err);
              pool.close();
            }
        
            ps.execute(paramValues, (err, result) => {
                if(err){
                  reject(err);
                  pool.close();
                }
                resolve(result);
                ps.unprepare(err => {
                    if(err){
                      reject(err);
                    }
                    pool.close();
                })
            })
        })
      })
  })
}


//when retrieving the DO from SAP, initialze the BX db
exports.packingScanItem=function(info){
  var params={
    DONumber:{type:"sql.VarChar(12)",value:info.DONumber},
    HUNumber:{type:'sql.VarChar(20)',value:info.HUNumber},
    MaterialCode:{type:'sql.VarChar(18)',value:info.MaterialCode},
    BatchNo:{type:'sql.VarChar(20)',value:info.BatchNo},
    PackBy:{type:'sql.VarChar(20)',value:info.PackBy},
    PackedOn:{type:'sql.VarChar(10)',value:info.PackedOn},
    FullScanCode:{type:'sql.VarChar(60)',value:info.FullScanCode},
    Status:{type:'sql.Char(1)',value:info.Status},
    Qty:{type:'sql.Int',value:info.Qty}
  }
  if (info.SerialNo){
    params.SerialNo=info.SerialNo;
  }
  return callStoredProcedure("dbo.InsertOrUpdatePacking",params)
}
exports.getMaterialCode=function(EANCode){
  var stmt = "select MaterialCode from dbo.SAP_EANCodes where EANCode=@EANCode";
  let paramTypes={EANCode:'sql.VarChar(20)'};
  let paramValues={EANCode:EANCode};
  return sqlQuery(stmt,paramTypes,paramValues)
}



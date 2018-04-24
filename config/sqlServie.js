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
// var pool,request ;
var callStoredProcedure=function(spName,inputParams,outParams){
  return new Promise(function(resolve,reject){
    var pool = new sql.ConnectionPool(config, err => {
        if (err){
          reject(err);
          pool.close();
        }
       var request = pool.request();
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

//insert DO into SAP_DOHeader and SAP_DODetail in BX
  exports.InsertOrUpdateDO=function(info){
    var params={
      DONumber:{type:"sql.VarChar(12)",value:info.DONumber},
      DOCreationDate:{type:'sql.VarChar(10)',value:info.DOCreationDate},
      DOCreationUser:{type:'sql.VarChar(20)',value:info.DOCreationUser},
      Plant:{type:'sql.VarChar(4)',value:info.Plant},
      ShipToCustomer:{type:'sql.VarChar(8)',value:info.ShipToCustomer},
      DOStatus:{type:'sql.Char(1)',value:info.DOStatus},
      DOItemNumberList:{type:'sql.VarChar(3500)',value:info.DOItemNumberList},
      MaterialCodeList:{type:'sql.VarChar(8000)',value:info.MaterialCodeList},
      BatchNumberList:{type:'sql.VarChar(5500)',value:info.BatchNumberList},
      VendorBatchList:{type:'sql.VarChar(8000)',value:info.VendorBatchList},
      DOQuantityList:{type:'sql.VarChar(2000)',value:info.DOQuantityList}
    }
    return callStoredProcedure("dbo.InsertOrUpdateDO",params)
  }
//insert Handlig Units list
  exports.createHandlingUnits=function(info){
    var params={
      DONumber:{type:"sql.VarChar(12)",value:info.DONumber},
      HUNumberList:{type:'sql.VarChar(8000)',value:info.HUNumberList},
      PackMaterial:{type:'sql.VarChar(18)',value:info.PackMaterial},
      CreatedBy:{type:'sql.VarChar(4)',value:info.CreatedBy},
      CreatedOn:{type:'sql.VarChar(8)',value:info.CreatedOn}
    }
    return callStoredProcedure("dbo.InsertHandlingUnits",params)
  }
  //Delete a Handling Unit
  exports.deleteHandlingUnit=function(HUNumber){
    var stmt = "delete from dbo.BX_PackHUnits where HUNumber=@HUNumber";
    let paramTypes={HUNumber:'sql.VarChar(20)'};
    let paramValues={HUNumber:HUNumber};
    return sqlQuery(stmt,paramTypes,paramValues)
  }
  //update quantity in BX_PackDetail --this is bad operation because user can update to more than planned qty
  exports.updatePackingScanQty=function(info){
    var stmt = "update dbo.BX_PackDetails SET ScanQty = @ScanQty WHERE DONumber=@DONumber and HUNumber=@HUNumber and MaterialCode=@MaterialCode and BatchNo=@BatchNo and PackBy=@PackBy and PackedOn=@PackedOn and SerialNo is null";
    return sqlQuery(stmt,getParamTypes(),info)
  }
  //Delete packing detail item
  exports.deletePackingItem=function(info){
    var stmt=stmt = "delete from dbo.BX_PackDetails WHERE DONumber=@DONumber and HUNumber=@HUNumber and MaterialCode=@MaterialCode and BatchNo=@BatchNo and PackBy=@PackBy and PackedOn=@PackedOn and SerialNo";
    if (info.serialNo){
      stmt += "@SerialNo";
    } else {
      stmt += " is null";
    }
    return sqlQuery(stmt,getParamTypes(),info)
  }


  var getParamTypes = function(){
    let paramTypes={ScanQty:'sql.Int'};
    paramTypes.DONumber='sql.VarChar(12)';
    paramTypes.HUNumber='sql.VarChar(20)';
    paramTypes.MaterialCode='sql.VarChar(18)';
    paramTypes.SerialNo='sql.VarChar(8)';
    paramTypes.BatchNo='sql.VarChar(20)';
    paramTypes.PackBy='sql.VarChar(20)';
    paramTypes.PackedOn='sql.VarChar(20)';
    return paramTypes;
  }


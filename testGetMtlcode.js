var dbsvc=require('./config/sqlServie')


var promise = dbsvc.getMaterialCode("00812917020015");
promise.then(function(result){
    // console.log("result=");
    if (result.recordset.length>0){
        console.dir(result.recordset[0].MaterialCode);
    } else {
        console.dir("materialCode cannot be found!");
    }
},function(err){
    console.error(err);
})
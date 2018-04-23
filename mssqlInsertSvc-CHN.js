/** 
 * Created by jack on 2017/8/26. 
 */  
var sqlserver = require('mssql');  
  
var msdb = {};  
var dbConfig = {  
    user: 'bxadmin',
    password: 'Bx@admin',
    server: 'sgdevbx', 
    database: 'BIOTRACK' 
};  
  
  
  
var db = function(strsql, callback){  
      
    sqlserver.connect(dbConfig).then(function () {  
        var req = new sqlserver.Request().query(strsql).then(function (recordset) {  
            console.log("call back invoked!");  
            callback(null,recordset);
        })  
            .catch(function (err) {  
                console.log(err);  
            });  
    })  

};  
  
  
var sql="select * from dbo.SAP_DODetail;"  
db(sql,function(err,result){  
    if (err) {  
        console.log(err);  
        return;  
    }  

    console.log("back to caller!");  
    // console.log(""+result);  
    return;
});  
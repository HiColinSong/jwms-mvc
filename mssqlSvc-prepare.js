var sql = require("mssql");

    // config for your database
    var config = {
        user: 'bxadmin',
        password: 'Bx@admin',
        server: 'sgdevbx', 
        database: 'BIOTRACK' 
    };
    var pool = new sql.ConnectionPool(config).connect(err=>{
        if (err){
            console.error(err);
            pool.close()
        }
        const ps = new sql.PreparedStatement(pool)
        ps.input('param', sql.VarChar(8))
        ps.prepare('select * from dbo.SAP_DODetail where DOitemNumber=@param', err => {
            // ... error checks
    
    
            ps.execute({param: 'do123'}, (err, result) => {
                if (err){
                    console.error(err);
                } else {
                    console.log(result.recordset[0]) // return 12345
                    console.log(result.rowsAffected) // Returns number of affected rows in case of INSERT, UPDATE or DELETE statement.
                }
    
                
                ps.unprepare(err => {
                    // ... error checks
                    console.error("error check:"+err);
                    pool.close();
                })
            })
        })
    })
    // var pool;
//     (async function query() {
//         var pool = await sql.connect(config)
//         const ps = new sql.PreparedStatement(pool)
//         ps.input('param', sql.VarChar(8))
//         ps.prepare('select * from dbo.SAP_DODetail where DOitemNumber=@param', err => {
//             // ... error checks


//             ps.execute({param: 'do123'}, (err, result) => {
//                 if (err){
//                     console.error(err);
//                 } else {
//                     console.log(result.recordset[0]) // return 12345
//                     console.log(result.rowsAffected) // Returns number of affected rows in case of INSERT, UPDATE or DELETE statement.
//                 }

                
//                 ps.unprepare(err => {
//                     // ... error checks
//                     console.error("error check:"+err);
//                     pool.close();
//                 })
//             })
//         })
// })()

sql.on('error', err => {
        console.error(err);
    // ... error handler
})

sql.on('done', () => {
    console.log("done!");
   return;
})
console.log("Done!");
return;
// async function executeParallelAsyncTasks () {
//   const [ valueA, valueB, valueC ] = await Promise.all([ functionA(), functionB(), functionC() ])
//   doSomethingWith(valueA)
//   doSomethingElseWith(valueB)
//   doAnotherThingWith(valueC)
// }
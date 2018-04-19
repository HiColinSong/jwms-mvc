var sql = require("mssql");

    // config for your database
    var config = {
        user: 'bxadmin',
        password: 'Bx@admin',
        server: 'sgdevbx', 
        database: 'BIOTRACK' 
    };

    // connect to your database
    // sql.connect(config, function (err) {
    
    //     if (err) console.log(err);

    //     //create Request object
    //     var request = new sql.Request();
           
    //     // query to the database and get the records
    //     request.query('select * from dbo.SAP_DODetail', function (err, recordset) {
            
    //         if (err) console.log(err)

    //         // send records as a response
    //         console.log(recordset);
            
    //     });
    // });
    (async function () {
    try {
        let pool = await sql.connect(config)
        let result = await pool.request()
            // .input('input_parameter', sql.Int, value)
            .query('select * from dbo.SAP_DODetail')
            
        console.log(result.recordsets.length) // count of recordsets returned by the procedure
    console.log(result.recordsets[0].length) // count of rows contained in first recordset
    console.log(result.recordset) // first recordset from result.recordsets
    console.log(result.returnValue) // procedure return value
    console.log(result.output) // key/value collection of output values
    console.log(result.rowsAffected) // array of numbers, each number represents the number of rows affected by executed statemens
    
        // Stored procedure
        
        // let result2 = await pool.request()
        //     .input('input_parameter', sql.Int, value)
        //     .output('output_parameter', sql.VarChar(50))
        //     .execute('procedure_name')
        
        // console.dir(result2)
    } catch (err) {
        console.error(err);
    } finally {

    }
})()

sql.on('error', err => {
        console.error(err);
    // ... error handler
})
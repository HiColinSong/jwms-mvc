var sql = require("mssql");

    // config for your database
    var config = {
        user: 'bxadmin',
        password: 'Bx@admin',
        server: 'sgdevbx', 
        database: 'BIOTRACK' 
    };

    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        //create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        request.query('select * from dbo.SAP_DODetail', function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            console.log(recordset);
            
        });
    });
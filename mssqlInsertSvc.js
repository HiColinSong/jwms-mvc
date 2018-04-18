var sql = require("mssql");

    // config for your database
    var config = {
        user: 'bxadmin',
        password: 'Bx@admin',
        server: 'sgdevbx', 
        database: 'BIOTRACK' 
    };
    const query = "INSERT INTO dbo.SAP_DODetail VALUES ('0800379646','do125','m123456','b123456','vb123456',20);"
    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        //create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        request.query(query, function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            console.log(recordset);
            
        });
    });
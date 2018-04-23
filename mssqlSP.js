var sql = require("mssql");

    // config for your database
    var config = {
        user: 'bxadmin',
        password: 'Bx@admin',
        server: 'sgdevbx', 
        database: 'BIOTRACK' 
    };
    (async function () {
        try {
            var pool = await sql.connect(config)
            // let result1 = await pool.request()
            //     .input('input_parameter', sql.Int, value)
            //     .query('select * from mytable where id = @input_parameter')
                
            // console.dir(result1)
        
            // Stored procedure
    //EXEC dbo.InsertOrUpdatePacking 
	// @DONumber='0800379642',
	// @HUNumber='HU111',
    // @MaterialCode='m123-11',
    // @BatChNo='batch001',
    // @SerialNo=NULL,
    // @PackBy='sean',
    // @PackedOn='20180422',
    // @Status=0,
    // @FullScanCode=NULL,
    // @Qty=1
    /*
    	@DONumber varchar(12),
	@HUNumber varchar(20),
    @MaterialCode varchar(18),
    @BatChNo varchar(20),
    @SerialNo varchar(8)=NULL,
    @PackBy varchar(20),
    @PackedOn varchar(10),
    @Status char(1),
    @FullScanCode varchar(60),
    @Qty int=1
    */

            let result2 = await pool.request()
                .input('DONumber', sql.VarChar(12), '0800379642')
                .input('HUNumber', eval('sql.VarChar(20)'), 'HU111')
                .input('MaterialCode', sql.VarChar(18), 'm123-11')
                .input('BatChNo', sql.VarChar(20), 'batch001')
                // .input('SerialNo', sql.VarChar(8), "180355AB")
                .input('PackBy', sql.VarChar(20), 'yadong')
                .input('PackedOn', sql.VarChar(20), '20180423')
                .input('FullScanCode', sql.VarChar(60), '2018042320')
                .input('Status', sql.Char(1), 0)
                .input('Qty', sql.Int, 1)
                // .output('output_parameter', sql.VarChar(50))
                .execute('dbo.InsertOrUpdatePacking')
            
            console.dir("result2:");
            console.dir(result2)
        } catch (err) {
            console.error("error!!!"+err);
        } finally {
            pool.close();
        }
    })()
     
    sql.on('error', err => {
        console.error("on error :"+err);
    })
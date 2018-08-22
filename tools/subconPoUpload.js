const ExcelReader = require('node-excel-stream').ExcelReader;
const fs = require('fs');

let sqlscript;


let dataStream = fs.createReadStream('./output/subconpo-20082018a.xlsx');
let reader = new ExcelReader(dataStream, {
    sheets: [{
        name: 'Overall',
        rows: {
            headerRow: 1,
            allowedHeaders: [
                {name: 'Scan',key: 'Scan'} 
                ,{name: 'No',key: 'No'}
            ]
        }
    }]
})

// @sFullScanCode			Varchar(60),
// @sReturnToTarget		Varchar(3),   -- SGW - BIT Warehouse, CHW - BESA Warehouse, SGQ - BIT QA
// @sLogonUser				Varchar(20),
reader.eachRow(function(row, rowNum, sheetSchema) {

    if (row.Scan){
        sqlscript=[
            "exec dbo.SPUpdateSubConReturns",
            "'"+row.Scan+"',",
            "'SGW',",
            "'e.ang'"
        ] 
        console.log(sqlscript.join(" "));       
    }
})
.then(function() {
    // console.log('done parsing');
});

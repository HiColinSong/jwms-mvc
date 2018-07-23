const ExcelReader = require('node-excel-stream').ExcelReader;
const fs = require('fs');

let dataStream = fs.createReadStream('./demo/eancode.xlsx');
let reader = new ExcelReader(dataStream, {
    sheets: [{
        name: 'Sheet1',
        rows: {
            headerRow: 1,
            allowedHeaders: [
                {name: 'Material',key: 'Material'} 
                ,{name: 'material',key: 'material'}
                ,{name: 'UM',key: 'UM'}
                ,{name: 'ConNo',key: 'ConNo'}
                ,{name: 'EAN/UPC',key: 'EAN'}
                ,{name: 'Ct',key: 'Ct'}
                ,{name: 'M',key: 'M'}
                ,{name: 'Numerat.',key: 'convertUnit'}
                ,{name: 'Denom.',key: 'Denom.'}
                // ,{name: 'ct',key: 'ct1',}
            ]
        }
    }]
})
reader.eachRow(function(rowData, rowNum, sheetSchema) {
    console.log("Insert into dbo.SAP_EANCodes values('"+rowData.EAN+"','"+rowData.material+"',"+rowData.convertUnit+")");
})
.then(function() {
    // console.log('done parsing');
});

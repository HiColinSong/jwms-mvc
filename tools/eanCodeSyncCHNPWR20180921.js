const ExcelReader = require('node-excel-stream').ExcelReader;
const fs = require('fs');

let dataStream = fs.createReadStream('./output/20180921CHNPWR.xlsx');
let reader = new ExcelReader(dataStream, {
    sheets: [{
        name: 'Sheet1',
        rows: {
            headerRow: 1,
            allowedHeaders: [
                {name: 'Plant',key: 'Plant'} 
                ,{name: 'Material',key: 'Material'}
                ,{name: 'EAN Code 1',key: 'EANCode1'}
                ,{name: 'UoM 1',key: 'UoM1'}
                ,{name: 'EAN Code 2',key: 'EANCode2'}
                ,{name: 'UoM 2',key: 'UoM2'}
                ,{name: 'Numerator 2',key: 'Numerator2'}
            ]
        }
    }]
})
reader.eachRow(function(rowData, rowNum, sheetSchema) {
    console.log("Insert into dbo.SAP_EANCodes values('0"+rowData.EANCode1+"','"+rowData.Material+"',"+1+")");
    console.log("Insert into dbo.SAP_EANCodes values('"+rowData.EANCode2+"','"+rowData.Material+"',"+rowData.Numerator2+")");
})
.then(function() {
    // console.log('done parsing');
});

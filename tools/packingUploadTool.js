const ExcelReader = require('node-excel-stream').ExcelReader;
const fs = require('fs');

let huNumbers=[
    "118072600045",
    "118072600046",
    "118072600047",
    "118072600048",
    "118072600049",
    "118072600050",
    "118072600051",
    "118072600052",
    "118072600053",
    "118072600054",
    "118072600055",
    "118072600056",
    "118072600057",
    "118072600058",
    "118072600059",
    "118072600060",
    "118072600061",
    "118072600062",
    "118072600063",
    "118072600064",
    "118072700013",
    "118072700014",
    "118072700015",
    "118072700016",
    "118072700017",
    "118072700018",
    "118072700019",
    "118072700020",
    "118072700021",
    "118072700022",
    "118072700023",
    "118072700024",
    "118072700025",
    "118072700026",
    "118072700027",
    "118072700028",
    "118072700029",
    "118072700030",
    "118072700031",
    "118072700032",
    "118072700033",
    "118072700034",
    "118072700035",
    "118072700036",
    "118072700037",
    "118072700038",
    "118072700039",
    "118072700040",
    "118072700041",
    "118072700042",
    "118072700043",
    "118072700044",
    "118072700045",
    "118072700046",
    "118072700047",
    "118072700048",
    "118072700049",
    "118072700050",
    "118072700051",
    "118072700052",
    "118072700053",
    "118072700054",
    "118072700055",
    "118072700056",
    "118072700057",
    "118072700058",
    "118072700059",
    "118072700060"
]

let info = {
    "DONumber":"0800540215",
    "PackedBy":"store-outgoing-sg",
    "PackedOn":"20180716 23:00:00"
}

let huIdx=-1;
var BC = require('./../web/js/services/barcode');
let barcode = new BC();
let sqlscript;


let dataStream = fs.createReadStream('./output/Quarantine shipment 27 Jul.xlsx');
let reader = new ExcelReader(dataStream, {
    sheets: [{
        name: 'Sheet1',
        rows: {
            headerRow: 1,
            allowedHeaders: [
                {name: 'barcode',key: 'barcode'} 
                ,{name: 'carton',key: 'carton'}
            ]
        }
    }]
})
reader.eachRow(function(row, rowNum, sheetSchema) {
    // console.log("Insert into dbo.SAP_EANCodes values('"+rowData.EAN+"','"+rowData.material+"',"+rowData.convertUnit+")");
    // console.log(row.barcode+"--"+row.carton);
    if (row.carton){
        huIdx++;
        // console.log("huIdx:"+huIdx+", carton:"+row.carton);
    }
    barcode.reset();
    if (row.barcode){
        barcode.barcode1=row.barcode;
        barcode.parseBarcode();
        sqlscript=[
            "exec dbo.InsertOrUpdatePacking",
            "'"+info.DONumber+"',",
            "'"+barcode.eanCode+"',",
            "'"+huNumbers[huIdx]+"',",
            "Null,",
            "'"+barcode.batchNo+"',",
            "Null,",
            "'"+barcode.serialNo+"',",
            "'"+info.PackedBy+"',",
            "'"+info.PackedOn+"',",
            "'"+1+"',",
            "'"+barcode.barcode1+"',",
            1
        ] 
        console.log(sqlscript.join(" "));       
    }
})
.then(function() {
    // console.log('done parsing');
});

const ExcelReader = require('node-excel-stream').ExcelReader;
const fs = require('fs');
/*bx - services.js - Yadong Zhu 2017*/ 
function Barcode(){}
Barcode.prototype.checkInfoComplete=function(){
    var self = this;
    if (!self.valid) {
        self.infoComplete = false;
        return;
    }
    self.errMsg = [];
    self.infoComplete = true;
    if (!self.eanCode){
        self.infoComplete = false;
        self.errMsg.push("EAN Code is required")
    }
    if (!self.expiry){
        self.infoComplete = false;
        self.errMsg.push("Expiry is required")
    }
    if (!self.batchNo||self.batchNo.legnth<7){
        self.infoComplete = false;
        self.errMsg.push("Batch No is required")
    }
    // if (!self.serialNo){
    //     //check if the batch is after the effective batch
    //     var batchDate=0;
    //     if (self.batchNo&&self.batchNo.length>7){
    //         batchDate = parseInt(self.batchNo.substring(1,7));
    //     }
    //     if (batchDate>=self.effectiveBatch&&!self.serialNo){
    //         self.infoComplete = false;
    //         self.errMsg.push("Missing Serial No")
    //     }
    // }

};
Barcode.prototype.reset=function(){
    this.barcode1 = undefined;
    this.barcode2 = undefined;
    this.eanCode = undefined;
    this.batchNo = undefined;
    this.expiry = undefined;
    this.serialNo = undefined;
    this.valid = undefined;
    this.infoComplete = undefined;
    this.errMsg=undefined;
    this.materialCode = undefined;
    this.materialRequired = undefined;
    this.serialNoRequired = undefined;
    this.sOverWritePreviousScan = undefined;
    this.quantity = undefined;
    this.scanType = undefined;
}
Barcode.prototype.parseBarcode=function(){
    var self = this;
    if (!self.barcode1&&!self.barcode2) return;
    // var barcode = (self.barcode1||"")+(self.barcode2||"");
    // var ascii29 = String.fromCharCode(29);
    var ascii29 = "|";
    var parser = function(code){ 
        self.valid=self.valid||true;
        if (code.legnth<3){
            self.valid=false;
            return;
        }
        var marker= code.substring(0,2);
        if (marker==="01"||marker==="02"){ //EAN code
            if (code.length>=16){
                self.eanCode=code.substring(2,16);
                if (code.length>16){
                    return parser(code.substring(16));
                } else {
                    self.valid=true;
                    return;
                }
            } else {
                self.valid=false;
                return;
            }
        } else if (marker==="17"){ //Expiry
            if (code.length>=6){
                self.expiry=code.substring(2,8);
                if (code.length>8){
                    return parser(code.substring(8));
                } else {
                    self.valid=true;
                    return;
                }
            } else {
                self.valid=false;
                return;
            }
        } else if (marker==="37"){ //Expiry
            if (code.length>3){
                return parser(code.substring(3));
            } else {
                self.valid=true;
                return;
            }
        } else if (marker==="10"||marker==="21"||marker==="30"||marker==="37"){
            var prop;

            switch(marker){
                case "10":
                    prop="batchNo";
                    break;
                case "21":
                    prop="serialNo";
                    break;
                default:
                    prop="info"+marker
            }


            //try to find ascii29
            var stopPosition=code.length;
            for (var i=0;i<code.length;i++){
                if (code.charAt(i)===ascii29){
                    stopPosition=i;
                    break;
                }
            }
            self[prop]=code.substring(2,stopPosition);
            if (code.length>stopPosition+1){
                return parser(code.substring(stopPosition+1));
            } else {
                self.valid=true;
                return;
            }
        } else {
            self.valid=false;
            return;
        }
    }
    if (self.barcode1)
        parser(self.barcode1);
    if (self.barcode2)
        parser(self.barcode2);
    
    self.checkInfoComplete();
}

Barcode.prototype.getFullBarcode=function(){
    return (this.barcode1||"")+(this.barcode2||"")
}

let huNumbers=[
"118092100000",
"118092100001",
"118092100002",
"118092100003",
"118092100004",
"118092100005",
"118092100006",
"118092100007",
"118092100008",
"118092100009",
"118092100010",
"118092100011",
"118092100012",
"118092100013",
"118092100014",
"118092100015",
"118092100016",
"118092100017",
"118092100018",
"118092100019",
"118092100020",
"118092100021",
"118092100022",
"118092100023",
"118092100024",
"118092100025",
"118092100026",
"118092100027",
"118092100028",
"118092100029",
"118092100030",
"118092100031",
"118092100032",
"118092100033",
"118092100034",
"118092100035",
"118092100036",
"118092100037",
"118092100038",
"118092100039",
"118092100040",
"118092100041",
"118092100042",
"118092100043"
]

let info = {
    "DONumber":"0800554278",
    "PackedBy":"ZL.YEW",
    "PackedOn":"20180920 14:30:00"
}

let huIdx=-1;
// var BC = require('./../web/js/services/barcode');
let barcode = new Barcode();
let sqlscript;


let dataStream = fs.createReadStream('./output/20180921packingupload.xlsx');
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
let previousCarton="";
reader.eachRow(function(row, rowNum, sheetSchema) {
    // console.log("Insert into dbo.SAP_EANCodes values('"+rowData.EAN+"','"+rowData.material+"',"+rowData.convertUnit+")");
    // console.log(row.barcode+"--"+row.carton);
    if (row.carton&&row.carton!==previousCarton){
        huIdx++;
        previousCarton=row.carton;
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
            "Null,",
            // "'"+barcode.serialNo+"',",
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

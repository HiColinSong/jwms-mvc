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

// module.exports = Barcode;
/*bx - services.js - Yadong Zhu 2017*/ 
(function() {
    'use strict';
    angular.module('bx.services')
    .service('scanItemSvc',['bxService','utilSvc',function(apiSvc,utilSvc){
        // var ascii29 = String.fromCharCode(29);
        // var resolver = function(code,bInfo){ 
        //     bInfo=bInfo||{isValid:true};
        //     if (code.length<3){
        //         bInfo.isValid=false;
        //         return bInfo;
        //     }
        //     var marker= code.substring(0,2);
        //     if (marker==="01"||marker==="02"){
        //         if (code.length>=16){
        //             bInfo.EANCode=code.substring(2,16);
        //             if (code.length>16){
        //                 return resolver(code.substring(16),bInfo);
        //             } else {
        //                 bInfo.isValid=true;
        //                 return bInfo;
        //             }
        //         } else {
        //             bInfo.isValid=false;
        //             return bInfo;
        //         }
        //     } else if (marker==="17"){
        //         if (code.length>=6){
        //             bInfo.expiry=code.substring(2,8);
        //             if (code.length>8){
        //                 return resolver(code.substring(8),bInfo);
        //             } else {
        //                 bInfo.isValid=true;
        //                 return bInfo;
        //             }
        //         } else {
        //             bInfo.isValid=false;
        //             return bInfo;
        //         }
        //     } else if (marker==="10"||marker==="21"||marker==="30"||marker==="37"){
        //         var prop;

        //         switch(marker){
        //             case "10":
        //                 prop="batchNo";
        //                 break;
        //             case "21":
        //                 prop="serialNo";
        //                 break;
        //             default:
        //                 prop="info"+marker
        //         }


        //         //try to find ascii29
        //         var stopPosition=code.length;
        //         for (var i=0;i<code.length;i++){
        //             if (code.charAt(i)===ascii29){
        //                 stopPosition=i;
        //                 break;
        //             }
        //         }
        //         bInfo[prop]=code.substring(2,stopPosition);
        //         if (code.length>stopPosition+1){
        //             return resolver(code.substring(stopPosition+1),bInfo);
        //         } else {
        //             bInfo.isValid=true;
        //             return bInfo;
        //         }
        //     } else {
        //         bInfo.isValid=false;
        //         return bInfo;
        //     }
        // }
        return {
            getBarcodeObj:function(){
                return new Barcode();
            },
            // resolveBarcode:function(barcodeInfo){
            //     /**
            //         Barcode contains any number of the following parts
            //         1. EAN Code:start with "01" or "02" followed by 14 chars
            //         2. Expiry: start with "17" followed by 6 chars
            //         3. BatchNo: start with "10" and end before the ASCII code 29 (Group Separator) or all the way to the end of barcode
            //         4. SerialNo: start with "21" and end before the ASCII code 29 (Group Separator) or all the way to the end of barcode
            //     */
            //     var _bInfo=resolver(barcodeInfo.barcode1,barcodeInfo);
            //     if (barcodeInfo.barcode2){
            //         _bInfo=resolver(barcodeInfo.barcode2,barcodeInfo);
            //     }
            //     return _bInfo; 
            // },
            // isValidToAddToOrder:function(info,plannedItems){
            //         var valid=true,errMsg,found=false;
            //         if (!info.material) {valid=false;errMsg="Material Code is required"}
            //         if (!info.batchNo)  {valid=false;errMsg="Batch No is required"}
            //         if (!info.expiry)  {valid=false;errMsg="Expiry is required"};
            //         if (!info.serialNo&&(!info.quantity||info.quantity<1))  {valid=false;}
            //         //check material/batch combination
            //         if (info.material&&info.batchNo){
            //             for (var i=0;i<plannedItems.length;i++){
            //                 if (plannedItems[i].MaterialCode===info.material&&plannedItems[i].BatchNo===info.batchNo){
            //                     found=true;
            //                     break;
            //                 }
            //             }
            //             if (!found){
            //                 {valid=false;errMsg="Material/Batch Combination not found"}
            //             }
            //         }
            //         if (!info.itemNumber) {valid=false;errMsg=errMsg||"Items are fully scanned!"}
            //         info.valid=valid;
            //         info.errMsg=errMsg;
            //         //not check the unique of the serial No. it will be checked Stored Procedure
            //         return valid
            // },
            insertScanItem:function(barcode,type,orderNo,HUNumber,callback){
                let params={};
                params.orderNo=orderNo;
                params.EANCode=barcode.eanCode;
                params.MaterialCode=barcode.materialCode;
                params.BatchNo=barcode.batchNo;
                params.scannedOn=utilSvc.formatDate();
                params.FullScanCode=barcode.getFullBarcode();
                params.Qty=barcode.quantity||1;
                params.Status=0;
                if (barcode.serialNo){
                    params.SerialNo=barcode.serialNo
                }
                if (type==="packing"){
                    params.HUNumber=HUNumber;
                }
                params.BinNumber=barcode.binNo;

                apiSvc.insertScanItem({type:type},params).$promise.then(
                    function(data){
                        console.log(data);
                        if (data&&data.length>0&&data[0].error)
                            callback(data[0].message.originalError.info);
                        else 
                            callback(null,data);
                    },
                    function(err){
                        callback(err);
                    }
                );
            },
            removeItem:function(items,item){

            },
            calculateScannedQtyForHUList:function(huList,plannedItems){
                var scannedItems,confirmReady=true;
                for (let i = 0; i < plannedItems.length; i++) {
                    plannedItems[i].ScanQty=0;
                    for (let j = 0; j < huList.length; j++) {
                        scannedItems=huList[j].scannedItems=huList[j].scannedItems||[];
                        for (let k = 0; k < scannedItems.length; k++) {
                            if (scannedItems[k].MaterialCode===plannedItems[i].MaterialCode&&
                                scannedItems[k].BatchNo===plannedItems[i].BatchNo&&
                                scannedItems[k].DOItemNumber===plannedItems[i].DOItemNumber){
                                    plannedItems[i].ScanQty+=scannedItems[k].ScanQty;
                                }
                        }
                    }
                    if (plannedItems[i].ScanQty<plannedItems[i].DOQuantity){
                        confirmReady=false;
                    }
                }
                for (let j = 0; j < huList.length; j++) {
                    scannedItems=huList[j].scannedItems=huList[j].scannedItems||[];
                    huList[j].scanQty= 0;
                    for (let k = 0; k < scannedItems.length; k++) {
                        huList[j].scanQty+=scannedItems[k].ScanQty||0
                    }
                }
                return confirmReady;
            } //end of function
            ,
            calculateScannedQty:function(scannedItems,plannedItems){
                for (let i = 0; i < plannedItems.length; i++) {
                    plannedItems[i].ScanQty=plannedItems[i].ScanQty||0;
                    for (let j = 0; j < scannedItems.length; j++) {
                        if (scannedItems[j].MaterialCode===plannedItems[i].MaterialCode&&
                            scannedItems[j].BatchNo===plannedItems[i].BatchNo&&
                            scannedItems[j].DOItemNumber===plannedItems[i].DOItemNumber){
                                plannedItems[i].ScanQty+=scannedItems[j].ScanQty;
                            }
                    }
                }
            } //end of function
            ,
            // findItemNumber:function(MaterialCode,BatchNo,plannedItems,itemNumberField){
            //     for (let i = 0; i < plannedItems.length; i++) {
            //         if (MaterialCode===plannedItems[i].MaterialCode&&
            //             BatchNo===plannedItems[i].BatchNo&&
            //             plannedItems[i].DOQuantity>plannedItems[i].ScanQty){
            //                 return plannedItems[i][itemNumberField];
            //             }
                    
            //     }
            //     return undefined;
            // } //end of function

        }

    }])
}());

/*bx - services.js - Yadong Zhu 2017*/ 
(function() {
    'use strict';
    angular.module('bx.services')
    .service('scanItemSvc',['bxService','utilSvc',function(apiSvc,utilSvc){
        return {
            getBarcodeObj:function(){
                return new Barcode();
            },
            insertScanItem:function(barcode,type,orderNo,HUNumber,callback){
                let params={};
                params.orderNo=orderNo;
                params.EANCode=barcode.eanCode;
                params.MaterialCode=barcode.materialCode;
                params.BatchNo=barcode.batchNo;
                params.scannedOn=utilSvc.formatDateTime();
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
                        // console.log(data);
                        if (data&&data.length>0&&data[0].error)
                            callback(data[0].message.originalError.info);
                        else 
                            callback(null,data);
                    },
                    function(err){
                        if (err.data&&err.data.length>0&&err.data[0].error)
                            callback(err.data[0].message.originalError.info);
                        else
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
                            if (scannedItems[k].MaterialCode.toUpperCase()===plannedItems[i].MaterialCode.toUpperCase()&&
                                scannedItems[k].BatchNo.toUpperCase()===plannedItems[i].BatchNo.toUpperCase()&&
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
            calculateScannedQty:function(scannedItems,plannedItems,itemNoFieldName,QuantityFiledName){
                var confirmReady=true;
                for (let i = 0; i < plannedItems.length; i++) {
                    plannedItems[i].ScanQty=0;
                    for (let j = 0; j < scannedItems.length; j++) {
                        if (scannedItems[j].MaterialCode.toUpperCase()===plannedItems[i].MaterialCode&&
                            scannedItems[j].BatchNo.toUpperCase()===plannedItems[i].BatchNo&&
                            scannedItems[j][itemNoFieldName]&&
                            plannedItems[i][itemNoFieldName]&&
                            scannedItems[j][itemNoFieldName].trim()===plannedItems[i][itemNoFieldName].trim()){
                                plannedItems[i].ScanQty+=scannedItems[j].ScanQty;
                            }
                    }
                    if (plannedItems[i].ScanQty<(plannedItems[i][QuantityFiledName]||plannedItems[i].Quantity)){
                        confirmReady=false;
                    }
                }
                return confirmReady
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

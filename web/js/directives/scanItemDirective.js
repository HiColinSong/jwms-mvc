/*bx - directives.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Directives */
    angular.module('bx.directives')
    .directive('scanItems', ['$timeout','bxService','scanItemSvc', 'utilSvc',
            function($timeout,apiSvc,itemSvc, util) {
                return {
                    restrict: 'A',
                    transclude: false,
                    templateUrl: 'partials/scan-items.html',
                    scope: {
                        // items: "=", //items already scanned in
                        // plannedItems: "=",//planned items from SAP
                        infoObj:"=info"//container object, and temp,barcodeInfo will be inside so that Main controller can view the values
                        // type:"@", //picking,packing,etc
                        // order:"="
                    },
                    link: function(scope, elem, attrs) {
                        //contain all barcode info, i.e. barcode1,barcode2,EANCode,BatchNo,Expiry,isBarcodeValid,SerialNo
                        scope.infoObj.barcodeInfo={};
                        scope.type=scope.infoObj.itemInfo.type;
                        scope.plannedItems = scope.infoObj.itemInfo.order.plannedItems;
                        if (scope.type==="packing"){
                            scope.items = scope.infoObj.itemInfo.temp.showHU.scannedItems;
                        } else {
                            scope.items = scope.infoObj.itemInfo.order.scannedItems;
                        }

                        scope.findItem=function(){
                            itemSvc.resolveBarcode(scope.infoObj.barcodeInfo);
                            scope.infoObj.itemInfo.batchNo=scope.infoObj.barcodeInfo.batchNo;
                            scope.infoObj.itemInfo.serialNo=scope.infoObj.barcodeInfo.serialNo;
                            scope.infoObj.itemInfo.expiry=scope.infoObj.barcodeInfo.expiry;
                            scope.infoObj.itemInfo.fullBarcode=scope.infoObj.barcodeInfo.barcode1+(scope.infoObj.barcodeInfo.barcode2||"");

                            if (itemSvc.isValidToAddToOrder(scope.infoObj.itemInfo)){
                                itemSvc.insertScanItem(scope.infoObj.itemInfo,function(err,data){
                                    if (err){
                                        if (err.originalError&&err.originalError.info&&err.originalError.info.message)
                                            scope.infoObj.itemInfo.errMsg=err.originalError.info.message
                                        else 
                                            scope.infoObj.itemInfo.errMsg=err
                                    }
                                    scope.infoObj.itemInfo.order.HUList = data;
                                    scope.resetScanInput();
                                })
                                return;
                            } else if (scope.infoObj.barcodeInfo.isValid&&scope.infoObj.barcodeInfo.EANCode&&!scope.infoObj.itemInfo.material){
                                //find material by EAN code if material is empty, if user already keys in, do not refrensh material
                                apiSvc.findMaterialByEAN({param1:scope.infoObj.barcodeInfo.EANCode})
                                .$promise.then(function(material){
                                            if (material){
                                                scope.infoObj.itemInfo.material=material.MaterialCode;
                                                if (itemSvc.isValidToAddToOrder(scope.infoObj.itemInfo)){
                                                    itemSvc.insertScanItem(scope.infoObj.itemInfo,function(err,data){
                                                        if (err){
                                                            if (err.originalError&&err.originalError.info&&err.originalError.info.message)
                                                                scope.infoObj.itemInfo.errMsg=err.originalError.info.message
                                                            else 
                                                                scope.infoObj.itemInfo.errMsg=err
                                                        }
                                                        scope.infoObj.itemInfo.order.HUList = data;
                                                        scope.resetScanInput();
                                                    })
                                                    return;
                                                } else if (!scope.infoObj.itemInfo.serialNo){
                                                    scope.infoObj.itemInfo.quantity=1;
                                                 }
                                            } else {
                                                console.warn("The Material can't be found for EANCode:"+scope.infoObj.barcodeInfo.EANCode)
                                            }
                                        },
                                        function(err){
                                            console.error(err);
                                        }) 
                             } else if (!scope.infoObj.itemInfo.serialNo){
                                scope.infoObj.itemInfo.quantity=1;
                             }
                        };
                        scope.removeItem=function(item){
                            for (var i=0;i<scope.items.length;i++){
                                if (item.serialNo){
                                    if (item.serialNo===scope.items[i].serialNo){
                                        scope.items.splice(i,1);
                                        return true;
                                    }  
                                } else if (!scope.items[i].serialNo){
                                    if (item.batchNo===scope.items[i].batchNo&&item.material===scope.items[i].material){
                                        scope.items.splice(i,1);
                                        return true;
                                    }  
                                }
                            }
                            return false;
                        }
                        scope.resetScanInput=function(){
                            scope.infoObj.barcodeInfo={};
                            scope.infoObj.itemInfo.batchNo=undefined;
                            scope.infoObj.itemInfo.serialNo=undefined;
                            scope.infoObj.itemInfo.expiry=undefined;
                            scope.infoObj.itemInfo.fullBarcode=undefined;
                            scope.infoObj.itemInfo.material=undefined;
                            scope.infoObj.itemInfo.valid=undefined;
                            scope.infoObj.itemInfo.errMsg=undefined;
                            scope.infoObj.itemInfo.quantity=undefined;
                        }
                        scope.$watchCollection( "items", function( items ) {
                            if (items){
                                scope.totalQty=0;
                                    for (var i=0;i<items.length;i++){
                                        scope.totalQty+=items[i].quantity||1;
                                    }
                                }
                            }
                        );
                    }
                };
            }
        ]);

 }())
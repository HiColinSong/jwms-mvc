/*bx - directives.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Directives */
    angular.module('bx.directives')
    .directive('scanItems', ['$timeout','bxService','scanItemSvc', 'utilSvc','soundSvc',
            function($timeout,apiSvc,itemSvc, util,soundSvc) {
                return {
                    restrict: 'A',
                    transclude: false,
                    templateUrl: 'partials/scan-items.html',
                    scope: {
                        // items: "=", //items already scanned in
                        // plannedItems: "=",//planned items from SAP
                        order:"=",
                        barcode:"=",
                        orderNo:"@",
                        type:"@", //picking,packing,rtgRectipts etc
                    },
                    link: function(scope, elem, attrs) {
                        //contain all barcode info, i.e. barcode1,barcode2,EANCode,BatchNo,Expiry,isBarcodeValid,SerialNo
                        scope.items=scope.order.scannedItems;
                        if (scope.type==='rtgreceipts'){
                            scope.createdByFieldDisplay = "Receipt By";
                            scope.createdByFieldName = "ReceiptBy";
                            scope.itemNoFieldName = "DOItemNumber";
                        } else if (scope.type==='reservation'){
                            scope.createdByFieldDisplay = "Created By";
                            scope.createdByFieldName = "CreatedBy";
                            scope.itemNoFieldName = "ResvItemNumber";
                        }
                        scope.findItem=function(){
                            scope.barcode.parseBarcode();
                            if (!scope.barcode.valid||!scope.barcode.infoComplete){
                                return;
                            }
        
                            itemSvc.insertScanItem(scope.barcode,scope.type,scope.orderNo,undefined,
                            function(err,data){
                                if (err&&err.message){
                                    if (err.message==='Error:Material Code cannot be found'){
                                        scope.barcode.materialRequired=true;
                                    }
                                    if (err.message==='Error:Serial Number is required'){
                                        scope.barcode.serialNoRequired=true;
                                    }
                                    scope.barcode.errMsg.push(err.message)
                                    soundSvc.play("badSound");
                                } else if(data){
                                    scope.items=scope.order.scannedItems = data;
                                    scope.barcode.reset();
                                    soundSvc.play("goodSound");
                                }
                            })
                        };
                        scope.removeItem=function(item){
                            apiSvc.removeScanItem({type:scope.type},{RowKey:item.RowKey,orderNo:scope.orderNo}).$promise.
                                then(function(data){
                                    if (data&&data.length>0&&data[0].error)
                                        console.error(data[0].message.originalError.info.message);
                                    else 
                                    scope.items=scope.order.scannedItems = data;
                                },function(error){
                                    console.error(error);
                                }
                            )
                        }
                        
                        scope.$watchCollection( "items", function( items ) {
                            if (items){
                                scope.order.confirmReady=itemSvc.calculateScannedQty(items,scope.order.plannedItems);
                                }
                            }
                        );
                    }
                };
            }
        ]);

 }())
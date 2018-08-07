/*bx - directives.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Directives */
    angular.module('bx.directives')
    .directive('scanItems', ['$window','$timeout','bxService','scanItemSvc', 'utilSvc','soundSvc',
            function($window,$timeout,apiSvc,itemSvc, util,soundSvc) {
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
                            scope.QuantityFieldName = "DOQuantity";
                        } else if (scope.type==='reservation'){
                            scope.createdByFieldDisplay = "Posted By";
                            scope.createdByFieldName = "PostBy";
                            scope.itemNoFieldName = "ResvItemNumber";
                            scope.QuantityFieldName = "Quantity";
                        }
                        scope.findItem=function(){
                            scope.items=scope.order.scannedItems=undefined;
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
                                    // scope.items=scope.order.scannedItems = data;
                                    scope.barcode.reset();
                                    soundSvc.play("goodSound");
                                }
                            })
                        };
                        scope.refreshScannedItems=function(){
                            util.pageLoading("start");
                            apiSvc.refreshScannedItems({type:scope.type},{orderNo:scope.orderNo}).$promise.
                                then(function(data){
                                    util.pageLoading("stop");
                                    if (data&&data.length>0&&data[0].error)
                                        console.error(data[0].message.originalError.info.message);
                                    else 
                                        scope.items=scope.order.scannedItems = data;
                                },function(error){
                                    console.error(error);
                                    util.pageLoading("stop");
                                }
                            )
                        }
                        scope.removeItem=function(item){
                            //find plannedItem:
                            if (scope.type==='reservation'){
                                for (let i = 0; i < scope.order.plannedItems.length; i++) {
                                    const plannedItem = scope.order.plannedItems[i];
                                    if (item.ResvItemNumber===plannedItem.ResvItemNumber){
                                        if (plannedItem.ResvStatus==='X'){
                                            util.addAlert("The item has been already posted!", "fail", true);
                                            return;
                                        }
                                        plannedItem.posting=undefined;
                                        break;
                                    }
                                }
                            }

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
                        scope.setFocus=function(elementId){
                            $window.document.getElementById(elementId).focus()
                          }
                        scope.$watchCollection( "items", function( items ) {
                            if (items){
                                scope.order.confirmReady=itemSvc.calculateScannedQty(items,scope.order.plannedItems,scope.itemNoFieldName,scope.QuantityFieldName);
                                }
                            }
                        );
                    }
                };
            }
        ]);

 }());
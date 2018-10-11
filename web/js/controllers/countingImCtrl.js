/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('countingImCtrl', ['$scope','$rootScope','$location','$routeParams','$modal','$timeout','piDoc',
                'utilSvc','scanItemSvc','bxService','modalConfirmSubmit','hotkeys','soundSvc',
            function($scope,$rootScope,$location,$routeParams,$modal,$timeout,piDoc,
                     utilSvc,itemSvc,apiSvc,confirmSubmit,hotkeys,soundSvc){
                    $scope.temp={};

        if (piDoc&&piDoc.docNo){
            // $scope.info={itemInfo:{orderNo:order.DONumber,temp:$scope.temp,order:$scope.order,type:"packing"}};
            utilSvc.addAlert("The document "+piDoc.docNo+" found", "success", true);

            $scope.piDoc=piDoc;
            $scope.docNo=piDoc.docNo;
            $scope.type = "counting-im";
            $scope.barcode = itemSvc.getBarcodeObj();


            // $scope.$watchCollection( "piDoc.scannedItems", function( item ) {
            //     if (item&&item.length>0){
            //         itemSvc.calculateScannedQty(piDoc.scannedItems,piDoc.items,"item","ScanQty")
            //     }
            // });
            

            
               //findItem
            $scope.findItem=function(){
                $scope.piDoc.scannedItems=undefined;
                $scope.barcode.parseBarcode();
                if (!$scope.barcode.valid||!$scope.barcode.infoComplete){
                    soundSvc.play("badSound");
                    $scope.barcode.errMsg=[];
                    $scope.barcode.errMsg.push("Invalid barcode!");
                    return;
                }
                if (!$scope.barcode.serialNo&&!$scope.barcode.quantity){
                    $scope.barcode.quantity=1;
                    if ($scope.barcode.isQtyBox){
                        $timeout(function(){
                            $rootScope.setFocus("scanQuantity");
                        },10)
                        return;
                    }
                }
                let params={};
                params.orderNo=$scope.docNo;
                params.fiscalYear=$scope.piDoc.fiscalYear;
                params.EANCode=$scope.barcode.eanCode;
                params.MaterialCode=$scope.barcode.materialCode;
                params.BatchNo=$scope.barcode.batchNo;
                params.scannedOn=utilSvc.formatDateTime();
                params.FullScanCode=$scope.barcode.getFullBarcode();
                params.Qty=$scope.barcode.quantity||1;
                if ($scope.barcode.serialNo){
                    params.SerialNo=$scope.barcode.serialNo
                }

                apiSvc.countingInsertScanItem({subtype:$scope.type},params).$promise.then(
                    function(data){
                        $scope.barcode.reset();
                        $scope.barcode.counter=($scope.barcode.counter||0)+1;
                        soundSvc.play("goodSound");
                    },
                    function(err){
                        let errMsg=err.data[0].message.originalError.info.message;
                        if (errMsg==='Error:Material Code cannot be found'){
                            $scope.barcode.materialRequired=true;
                        }
                        if (errMsg==='Error:Serial Number is required'){
                            $scope.barcode.serialNoRequired=true;
                        }
                        $scope.barcode.errMsg.push(errMsg)
                        soundSvc.play("badSound");
                    })
            };
                $scope.removeItem=function(item){
                    apiSvc.removeScanItem({type:$scope.type},{RowKey:item.RowKey,orderNo:item.DONumber}).$promise.
                        then(function(data){
                            if (data&&data.length>0&&data[0].error)
                                console.error(data[0].message.originalError.info.message);
                            else 
                                $scope.order.HUList = data;
                        },function(error){
                            console.error(error);
                        }
                    )
                }
                $scope.refreshScannedItems=function(){
                    apiSvc.refreshPacking({type:$scope.type,param1:order.DONumber}).$promise.
                        then(function(data){
                            if (data&&data.length>0&&data[0].error)
                                console.error(data[0].message.originalError.info.message);
                            else 
                                $scope.order.HUList = data;
                        },function(error){
                            console.error(error);
                        }
                    )
                }
                $scope.confirmCountinging = function() {
                    utilSvc.pageLoading("start");
                    apiSvc.confirmOperation({type:"packing"},{order:{DONumber:order.DONumber},PackComplete:utilSvc.formatDateTime()}).$promise.
                    then(function(data){
                        utilSvc.pageLoading("stop");
                        if (data&&data.confirm==='success'){
                            $scope.confirm={
                                type:"success",
                                modalHeader: 'Packing Confirmation Success',
                                message:"The delivery order is confirmed successfully!",
                                resetPath:"/fulfillment/packing"
                            }
                        } else if(data&&data.error&&data.message){
                            $scope.confirm={
                                type:"danger",
                                modalHeader: 'Packing Confirmation Fail',
                                message:data.message,
                            }
                        } else if(data&&data.confirm==='fail'){
                            $scope.confirm={
                                type:"danger",
                                modalHeader: 'Packing Confirmation Fail',
                                message:"The delivery order is invalid, confirmation is failed!",
                            }
                        } else {
                            $scope.confirm={
                                type:"danger",
                                modalHeader: 'Packing Confirmation Fail',
                                message:"Unknown error, confirmation is failed!",
                            }
                        }
                        confirmSubmit.do($scope);
                    },function(err){
                        utilSvc.pageLoading("stop");
                        console.error(err);
                        $scope.confirm={
                            type:"danger",
                            message:err.data.message||"System error, confirmation is failed!",
                        }
                        confirmSubmit.do($scope);
                    });
                }
                let calculateScannedQty=function(scannedItems,items){
                    for (let i = 0; i < items.length; i++) {
                        items[i].ScanQty=0;
                        for (let j = 0; j < scannedItems.length; j++) {
                            if (scannedItems[j].MaterialCode.toUpperCase()===items[i].MaterialCode&&
                                scannedItems[j].BatchNo.toUpperCase()===items[i].BatchNo&&
                                scannedItems[j].itemNo.toUpperCase()===items[i].item){
                                    items[i].ScanQty+=scannedItems[j].ScanQty;
                                }
                        }
                    }
                } //end of function
                calculateScannedQty($scope.piDoc.scannedItems,$scope.piDoc.items);
        } else {
            $scope.piDoc={};
            if (piDoc&&piDoc.status===400&&piDoc.data.message){ //in case $scope.piDoc is NOT valid
                utilSvc.addAlert(piDoc.data.message, "fail", false);
            } else {
                if ($routeParams.docNo)
                    utilSvc.addAlert("The PI Document "+$routeParams.docNo+" doesn't exist!", "fail", false);
            }
            $scope.submitForm = function() {
                if (!$scope.piDoc.docNo){
                    $rootScope.setFocus("docNo");
                    return;
                }
                if (!$scope.piDoc.fiscalYear){
                    $rootScope.setFocus("fiscalYear");
                    return;
                }
                //add leading 0 to the scanned order no
                $location.path("/store-ops/counting-im/"+utilSvc.formalizeOrderNo($scope.piDoc.docNo)+"/"+$scope.piDoc.fiscalYear);
            }
        }

    }])
 }());

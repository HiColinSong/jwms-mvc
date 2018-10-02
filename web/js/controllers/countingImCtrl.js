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


            $scope.$watchCollection( "piDoc.scannedItems", function( item ) {
                if (item&&item.length>0){
                    itemSvc.calculateScannedQty(piDoc.scannedItems,piDoc.items,"item","ScanQty")
                }
            });
            

            
                //findItem
                $scope.findItem=function(){
                    $scope.temp.showHU.scannnedItems=undefined;
                    $scope.barcode.parseBarcode();
                    if (!$scope.barcode.valid||!$scope.barcode.infoComplete){
                        soundSvc.play("badSound");
                        $scope.barcode.errMsg=[];
                        $scope.barcode.errMsg.push("Invalid barcode!");
                        return;
                    }
                    if (!$scope.barcode.serialNo&&!$scope.barcode.quantity){
                        $scope.barcode.quantity=1;
                        $scope.barcode.scanType="1";
                        $timeout(function(){
                            $rootScope.setFocus("scanQuantity");
                        },10)
                        return;
                    }

                    itemSvc.insertScanItem($scope.barcode,$scope.type,order.DONumber,$scope.temp.showHU.HUNumber,
                    function(err,data){
                        if (err&&err.message){
                            if (err.message==='Error:Material Code cannot be found'){
                                $scope.barcode.materialRequired=true;
                            }
                            if (err.message==='Error:Serial Number is required'){
                                $scope.barcode.serialNoRequired=true;
                            }
                            $scope.barcode.errMsg.push(err.message)
                            soundSvc.play("badSound");
                        } else if(data){
                            // $scope.order.HUList = data;
                            $scope.barcode.reset();
                            soundSvc.play("goodSound");
                        }
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

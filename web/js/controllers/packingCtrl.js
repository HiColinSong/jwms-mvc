/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('packingCtrl', ['$scope','$rootScope','$location','$routeParams','$modal','$timeout','order',
                'utilSvc','scanItemSvc','bxService','modalConfirmSubmit','hotkeys','soundSvc',
            function($scope,$rootScope,$location,$routeParams,$modal,$timeout,order,
                     utilSvc,itemSvc,apiSvc,confirmSubmit,hotkeys,soundSvc){
                    $scope.temp={};

        if (order&&order.DONumber){
            // $scope.info={itemInfo:{orderNo:order.DONumber,temp:$scope.temp,order:$scope.order,type:"packing"}};
            if (order.confirmStatus!=='C'){
                utilSvc.addAlert("The delivery order "+order.DONumber+" found", "success", true);
            } else {
                utilSvc.addAlert("The delivery order "+order.DONumber+" has been confirmed", "warning", false);
            }
            $scope.order=order;
            order.HUList=order.HUList||[];
            $scope.temp.showHU=order.HUList[0];
            $scope.temp.showHUIdx=0;
            $scope.DONumber=order.DONumber;
            $scope.createdByFieldDisplay = "Pack By";
            $scope.createdByFieldName = "PackBy";
            $scope.itemNoFieldName = "DOItemNumber";
            $scope.QuantityFieldName = "DOQuantity";
            $scope.type = "packing";
            $scope.barcode = itemSvc.getBarcodeObj();

            //get customer name
            // if (order.ShipToCustomer)
            //     apiSvc.getCustomerName({ShipToCustomer:order.ShipToCustomer}).$promise.
            //     then(function(data){
            //         order.ShipToCustomerName=data.customerName;
            //     },function(err){
            //         console.error(err);
            //     });

            $scope.$watchCollection( "temp.showHU", function( hu ) {
                if (hu){
                    $scope.items=hu.scannedItems;
                    $scope.confirmReady=itemSvc.calculateScannedQtyForHUList(order.HUList,order.plannedItems);
                }
            });
            $scope.$watchCollection( "order.HUList", function( huList ) {
                if (huList&&huList.length>0){
                    $scope.items=$scope.temp.showHU.scannedItems=huList[$scope.temp.showHUIdx].scannedItems;
                    $scope.confirmReady=itemSvc.calculateScannedQtyForHUList(order.HUList,order.plannedItems);
                }
            });
            

            $scope.removeHU=function(HUNumber){
                apiSvc.removeHu({type:$scope.type},{DONumber:order.DONumber,HUNumber:HUNumber}).$promise.
                    then(function(data){
                        if (data&&data.length>0&&data[0].error){
                            console.error(data[0].message.originalError.info.message);
                            utilSvc.addAlert(data[0].message.originalError.info.message, "fail", false);
                        } else if (data){
                            for (let i = 0; i < data.length; i++) {
                                data[i].scannedItems=data[i].scannedItems||[]
                            }
                            $scope.order.HUList = data;
                            $scope.temp.showHU=order.HUList[0];
                            $scope.temp.showHUIdx=0;
                        }

                    },function(error){
                        console.error(error);
                    }
                )
            };
                
                $scope.addNewHu=function(){
                    var modalInstance;
                    modalInstance = $modal.open({
                        templateUrl: 'partials/add-new-hu.html',
                        windowClass: "sub-detail-modal",
                        controller: "addNewHuCtrl",
                        backdrop: "static",
                        scope:$scope,
                        resolve:{
                            pkgMtlList:['$q','bxService',
                                function($q,apiSvc){
                                    var deferred = $q.defer();
                                        apiSvc.getPkgMaterialList({}).$promise.then(function(data){
                                            if (data){
                                                deferred.resolve(data);
                                            } else {
                                                deferred.resolve(undefined);
                                            }
                                        },function(err){
                                            deferred.reject(err);
                                        })
                                    return deferred.promise;
                            }]
                        }
                    });
                    modalInstance.result.then(function(data) {
                        for (let i = 0; i < data.length; i++) {
                            data[i].scannedItems=data[i].scannedItems||[]
                        }
                        $scope.order.HUList = data;
                        $scope.temp.showHU=order.HUList[0];
                        $scope.temp.showHUIdx=0;
                    });
                };
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
                        if ($scope.barcode.isQtyBox){
                            $timeout(function(){
                                $rootScope.setFocus("scanQuantity");
                            },10)
                            return;
                        }
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
                            $scope.barcode.counter=($scope.barcode.counter||0)+1;
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
                $scope.confirmPacking = function() {
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

                 hotkeys.add({
                    combo: 'shift+down',
                    description: 'This select HU down',
                    callback: function() {
                        $scope.temp.showHUIdx=Math.min($scope.temp.showHUIdx+1,$scope.order.HUList.length-1)
                        $scope.temp.showHU=$scope.order.HUList[$scope.temp.showHUIdx];
                    }
                  });
                 hotkeys.add({
                    combo: 'shift+up',
                    description: 'This select HU above',
                    callback: function() {
                        $scope.temp.showHUIdx=Math.max($scope.temp.showHUIdx-1,0)
                        $scope.temp.showHU=$scope.order.HUList[$scope.temp.showHUIdx];
                    }
                  });

        } else {
            $scope.order={};
            if (order&&order.error){ //in case order is NOT valid
                utilSvc.addAlert(order.message, "faile", false);
            } else {
                if ($routeParams.DONumber)
                    utilSvc.addAlert("The delivery order "+$routeParams.DONumber+" doesn't exist!", "fail", false);
            }
            $scope.submitForm = function() {
                //add leading 0 to the scanned order no
                $location.path("/fulfillment/packing/"+utilSvc.formalizeOrderNo($scope.order.DONumber));
            }
        }

    }])
 }());

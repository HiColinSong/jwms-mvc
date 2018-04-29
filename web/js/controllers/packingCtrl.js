/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('packingCtrl', ['$scope','$location','$routeParams','$modal','order','utilSvc','scanItemSvc','bxService','modalConfirmSubmit','hotkeys',
    		function($scope,$location,$routeParams,$modal,order,utilSvc,itemSvc,apiSvc,confirmSubmit,hotkeys){

                    $scope.temp={};
                    // $scope.info={DONumber:$routeParams.DONumber};
                    // $scope.categories=constants.categories;

        if (order&&order.DONumber&&(!order.status||order.status==='valid')){
            // $scope.info={itemInfo:{orderNo:order.DONumber,temp:$scope.temp,order:$scope.order,type:"packing"}};
            utilSvc.addAlert("The delivery order "+$routeParams.DONumber+" found", "success", true);
            $scope.order=order;
            order.HUList=order.HUList||[];
            $scope.temp.showHU=order.HUList[0];
            $scope.temp.showHUIdx=0;
            $scope.DONumber=order.DONumber;
            $scope.createdByFieldDisplay = "Pack By";
            $scope.createdByFieldName = "PackBy";
            $scope.itemNoFieldName = "DOItemNumber";
            $scope.type = "packing";

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
                apiSvc.removeHu({DONumber:order.DONumber,HUNumber:HUNumber}).$promise.
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
                    itemSvc.resolveBarcode($scope.temp.barcodeInfo);
                    $scope.temp.barcodeInfo.orderNo=order.DONumber;
                    $scope.temp.barcodeInfo.showHU=$scope.temp.showHU;
                    $scope.temp.barcodeInfo.itemNumber=
                        itemSvc.findItemNumber($scope.temp.barcodeInfo.material,$scope.temp.barcodeInfo.batchNo,order.plannedItems,"DOItemNumber");
                    if ($scope.temp.barcodeInfo.isValid&&$scope.temp.barcodeInfo.EANCode&&!$scope.temp.barcodeInfo.material){
                        //find material by EAN code if material is empty, if user already keys in, do not refrensh material
                        apiSvc.findMaterialByEAN({param1:$scope.temp.barcodeInfo.EANCode})
                        .$promise.then(function(material){
                            if (material){
                                $scope.temp.barcodeInfo.material=material.MaterialCode;
                                $scope.temp.barcodeInfo.itemNumber=
                                itemSvc.findItemNumber($scope.temp.barcodeInfo.material,$scope.temp.barcodeInfo.batchNo,order.plannedItems,"DOItemNumber");
                                    if (itemSvc.isValidToAddToOrder($scope.temp.barcodeInfo,order.plannedItems)){
                                        itemSvc.insertScanItem($scope.temp.barcodeInfo,"packing",function(err,data){
                                            if (err&&err.message){
                                                $scope.temp.barcodeInfo.errMsg=err.message
                                            } else if(data){
                                                $scope.order.HUList = data;
                                                $scope.resetScanInput();
                                            }
                                        })
                                        return;
                                    } else if (!$scope.temp.barcodeInfo.serialNo){
                                        $scope.temp.barcodeInfo.quantity=1;
                                        }
                                } else {
                                    console.warn("The Material can't be found for EANCode:"+scope.temp.barcodeInfo.EANCode);
                                    $scope.temp.barcodeInfo.errMsg="The Material can't be found,please manually input";
                                }
                            },
                                function(err){
                                    console.error(err);
                                }) 
                     } else if (itemSvc.isValidToAddToOrder($scope.temp.barcodeInfo,order.plannedItems)){
                        itemSvc.insertScanItem($scope.temp.barcodeInfo,"packing",function(err,data){
                            if (err&&err.message){
                                $scope.temp.barcodeInfo.errMsg=err.message
                            } else if(data){
                                $scope.order.HUList = data;
                                $scope.resetScanInput();
                            }
                        })
                        return;
                    } else if (!$scope.temp.barcodeInfo.serialNo){
                        $scope.temp.barcodeInfo.quantity=1;
                     }
                };
                $scope.resetScanInput=function(){
                    if ($scope.temp.barcodeInfo)
                        $scope.temp.barcodeInfo={binNo:$scope.temp.barcodeInfo.binNo};
                }
                $scope.removeItem=function(item){
                    apiSvc.removeScanItem({type:"packing"},{RowKey:item.RowKey,orderNo:item.DONumber}).$promise.
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
                $scope.refreshPacking=function(){
                    apiSvc.refreshPacking({param1:order.DONumber}).$promise.
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
                    apiSvc.confirmOperation({type:"packing"},{order:order,PackComplete:utilSvc.formatDate()}).$promise.
                    then(function(data){
                        if (data&&data.confirm==='success'){
                            $scope.confirm={
                                type:"success",
                                message:"The delivery order is confirmed successfully!",
                                resetPath:"/fulfillment/packing"
                            }
                        } else if(data&&data.confirm==='fail'){
                            $scope.confirm={
                                type:"warn",
                                message:"The delivery order is invalid, confirmation is failed!",
                            }
                        } else {
                            $scope.confirm={
                                type:"danger",
                                message:"Unknown error, confirmation is failed!",
                            }
                        }
                        confirmSubmit.do($scope);
                    },function(err){
                        console.err(err);
                        $scope.confirm={
                            type:"danger",
                            message:"System error, confirmation is failed!",
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
                $location.path("/fulfillment/packing/"+$scope.order.DONumber);
            }
        }

    }])
 }())

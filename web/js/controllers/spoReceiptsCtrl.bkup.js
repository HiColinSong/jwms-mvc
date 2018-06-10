/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('spoReceiptsCtrl', ['$scope','$location','$routeParams','$filter','utilSvc','list',
                'bxService','constants','modalConfirmSubmit','scanItemSvc','soundSvc',
            function($scope,$location,$routeParams,$filter,utilSvc,pendingList,
                     apiSvc,constants,confirmSubmit,itemSvc,soundSvc){

                    // $scope.categories=constants.categories;

        if ($routeParams.shipToTarget){
            if ($routeParams.shipToTarget==="SGQ"){
                apiSvc.getQASampleCategoryList().$promise.then(function(data){
                    $scope.qaSampleCategoryList = data;
                },function(err){
                    console.error(JSON.stringify(err,null,2));
                })
            }
            $scope.list=pendingList;
            $scope.uniqueSubconPo=$filter("unique")(pendingList,"subConPo")


            $scope.shipToTarget = $routeParams.shipToTarget;
            $scope.barcode = itemSvc.getBarcodeObj();
                $scope.findItem=function(){
                    var param = {sFullScanCode:$scope.barcode.barcode1,dCurrDate:new Date()};
                    param.sReturnToTarget = $routeParams.shipToTarget;
                    if ( $scope.barcode.qaCategory){
                        param.sQACategory =  $scope.barcode.qaCategory.QASampleID;
                    }
                    apiSvc.updateSubconReturn(param).$promise.then(
                        function(data){
                            // console.log(JSON.stringify(data,null,2));
                            soundSvc.play("goodSound");
                            let removedSerialNo = data[0].SerialNo;
                            utilSvc.removeItemById(removedSerialNo,$scope.list,"SerialNo")
                            $scope.uniqueSubconPo=$filter("unique")($scope.list,"subConPo");
                            $scope.barcode.reset();
                        },function(err){
                            soundSvc.play("badSound");
                            // console.error(JSON.stringify(err,null,2));
                            if (err.data[0].message.trim())
                                utilSvc.addAlert(err.data[0].message, "fail", false);
                            else
                                utilSvc.addAlert('Unknow error!', "fail", false);
                        })

                }
                $scope.confirmReceipt = function() {
                    apiSvc.confirmOperation({type:"spoReceipts"},$scope.receipts).$promise.then(function(data){
                                if (data){
                                    $scope.confirm=data;
                                    confirmSubmit.do($scope);
                                }
                            },function(err){
                                console.err(err);
                            });
                }
        } else {
            $scope.scanReceipt = function(shipToTarget) {
                $location.path("/receiving/spoReceipts/"+shipToTarget);
            }
        }
    }])
 }())

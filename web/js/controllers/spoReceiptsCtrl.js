/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('spoReceiptsCtrl', ['$scope','$location','$routeParams','utilSvc',
                'bxService','constants','modalConfirmSubmit','scanItemSvc','soundSvc',
            function($scope,$location,$routeParams,utilSvc,
                     apiSvc,constants,confirmSubmit,itemSvc,soundSvc){

                    $scope.receipts={};
                    $scope.categories=constants.categories;

        if ($routeParams.categoryId){
            $scope.receipts={plannedItems:[],scannedItems:[],orderNo:'na',categoryId:$routeParams.categoryId};
            $scope.categories=constants.categories;
            $scope.barcode = itemSvc.getBarcodeObj();
                $scope.findItem=function(){
                    var param = {sFullScanCode:$scope.barcode.barcode1,dCurrDate:new Date()};
                    if ($routeParams.categoryId==='bit'){
                        param.sReturnToTarget = "SGW";
                    } else {
                        param.sReturnToTarget = "SGQ";
                        sQACategory = "";
                    }
                    apiSvc.updateSubconReturn(param).$promise.then(
                        function(data){
                            console.log(JSON.stringify(data,null,2));
                        },function(err){
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
            $scope.scanReceipt = function(categoryId) {
                $location.path("/receiving/spoReceipts/"+categoryId);
            }
        }
    }])
 }())

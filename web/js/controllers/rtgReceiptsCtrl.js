/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('rtgReceiptsCtrl', ['$scope','$location','$routeParams','order','utilSvc',
                'bxService','modalConfirmSubmit','scanItemSvc','soundSvc',
            function($scope,$location,$routeParams,order,utilSvc,
                 apiSvc,confirmSubmit,itemSvc,soundSvc){

                    $scope.temp={};
        // $scope.onBlur = function($event) {
        //     console.log($event);
        //     $event.currentTarget.focus();
        // }
        if (order&&order.DONumber&&(!order.status||order.status==='valid')){
                utilSvc.addAlert("The delivery order "+$routeParams.DONumber+" found", "success", true);
                order.scannedItems=order.scannedItems||[]
                $scope.order=order;
                $scope.DONumber=order.DONumber;
                $scope.createdByFieldDisplay = "Pack By";
                $scope.createdByFieldName = "PackBy";
                $scope.itemNoFieldName = "DOItemNumber";
                $scope.type = "rtgreceipts";
                $scope.barcode = itemSvc.getBarcodeObj();

                $scope.confirmReceipt = function() {
                    utilSvc.pageLoading("start");
                    apiSvc.confirmOperation({type:"rtgreceipts"},{order:order,currentDate:utilSvc.formatDate()}).$promise.
                    then(function(data){
                        utilSvc.pageLoading("stop");
                        if (data&&data.confirm==='success'){
                            $scope.confirm={
                                type:"success",
                                modalHeader: 'RGA Confirmation Success',
                                message:"RGA is confirmed successfully!",
                                resetPath:"/receiving/rtgReceipts"
                            }
                        } else if(data&&data.error&&data.message){
                            $scope.confirm={
                                type:"danger",
                                modalHeader: 'RGA Confirmation Fail',
                                message:data.message,
                            }
                        } else if(data&&data.confirm==='fail'){
                            $scope.confirm={
                                type:"danger",
                                modalHeader: 'RGA Confirmation Fail',
                                message:"The delivery order is invalid, confirmation is failed!",
                            }
                        } else {
                            $scope.confirm={
                                type:"danger",
                                modalHeader: 'RGA Confirmation Fail',
                                message:"Unknown error, confirmation is failed!",
                            }
                        }
                        confirmSubmit.do($scope);
                    },function(err){
                        utilSvc.pageLoading("stop");
                        console.error(err);
                        $scope.confirm={
                            type:"danger",
                            modalHeader: 'RGA Confirmation Fail',
                            message:err.data.message||"System error, Operation is failed!",
                        }
                        confirmSubmit.do($scope);
                    });
                }

        } else {
            $scope.order={};
            if (order&&order.error){ //in case order is NOT valid
                utilSvc.addAlert(order.message, "faile", false);
            } else {
                if ($routeParams.DONumber)
                    utilSvc.addAlert("The delivery order "+$routeParams.DONumber+" doesn't exist!", "fail", false);
            }
            $scope.submitForm = function() {
                $location.path("/receiving/rtgReceipts/"+utilSvc.formalizeOrderNo($scope.order.DONumber));
            }
        }
    }])
 }())

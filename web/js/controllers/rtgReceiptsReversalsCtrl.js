/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('rtgReceiptsReversalsCtrl', ['$scope','$location','$routeParams','utilSvc',
                'bxService','modalConfirmSubmit','scanItemSvc','soundSvc',
            function($scope,$location,$routeParams,utilSvc,
                 apiSvc,confirmSubmit,itemSvc,soundSvc){

        var order={};

        if ($routeParams.DONumber){
            utilSvc.pageLoading("start");
            apiSvc.rgaReversals({orderNo:$routeParams.DONumber,currentDate:utilSvc.formatDate()}).$promise.then(
                function(data){
                    utilSvc.pageLoading("stop");
                    if (data&&data.confirm==='success'){
                        $scope.confirm={
                            type:"success",
                            modalHeader: 'Operation Success',
                            message:"The operation is confirmed successfully!",
                        }
                    } else if(data&&data.error&&data.message){
                        $scope.confirm={
                            type:"danger",
                            modalHeader: 'Operation Fail',
                            message:data.message,
                        }
                    } else if(data&&data.confirm==='fail'){
                        $scope.confirm={
                            type:"damger",
                            modalHeader: 'Operation Fail',
                            message:"The operaton is failed!",
                        }
                    } else {
                        $scope.confirm={
                            type:"danger",
                            modalHeader: 'Operation Fail',
                            message:"Unknown error, confirmation is failed!",
                        }
                    }
                    confirmSubmit.do($scope);
                },function(err){
                    utilSvc.pageLoading("stop");
                    console.error(err);
                    $scope.confirm={
                        type:"danger",
                        modalHeader: 'Operation Fail',
                        message:err.data.message||"System error, Operation is failed!",
                    }
                    confirmSubmit.do($scope);
                }
            );

        } else {
            $scope.order={};
            if (order&&order.error){ //in case order is NOT valid
                utilSvc.addAlert(order.message, "faile", false);
            } else {
                if ($routeParams.DONumber)
                    utilSvc.addAlert("The delivery order "+$routeParams.DONumber+" doesn't exist!", "fail", false);
            }
            $scope.submitForm = function() {
                $location.path("/receiving/rtgReceipts-reversals/"+utilSvc.formalizeOrderNo($scope.order.DONumber));
            }
        }
    }])
 }())

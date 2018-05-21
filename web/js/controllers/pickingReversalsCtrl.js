/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('pickingReversalsCtrl', ['$scope','$location','$routeParams','order','utilSvc','bxService','modalConfirmSubmit',
    		function($scope,$location,$routeParams,order,utilSvc,apiSvc,confirmSubmit){
        if (order&&order.TONumber){
            if (order.PickConfirmStatus!=='X'){
                utilSvc.addAlert("The transfer order "+$routeParams.TONumber+" found", "success", true);
            } else {
                utilSvc.addAlert("The transfer order "+$routeParams.TONumber+" has been confirmed", "warning", true);
            }
            order.scannedItems=order.scannedItems||[];
            $scope.order=order;
            $scope.TONumber=order.TONumber;
            $scope.chooseReversal=function(){
                $scope.order.reversals=false;
                for (let i = 0; i < order.plannedItems.length; i++) {
                    if (order.plannedItems[i].reversal){
                        $scope.order.reversals=true;
                        break;
                    }
                }
            }

            $scope.submitReversals=function(){
                utilSvc.pageLoading("start");
                apiSvc.pickingReversals({order:$scope.order})
                        .$promise.then(
                            function(data){
                                utilSvc.pageLoading("stop");
                                if (data&&data.confirm==='success'){
                                    $scope.confirm={
                                        type:"success",
                                        modalHeader: 'Picking Reversals Success',
                                        message:"The picking reversal is done successfully!",
                                    }
                                } else if(data&&data.error&&data.message){
                                    $scope.confirm={
                                        type:"danger",
                                        modalHeader: 'The picking reversals Failed',
                                        message:data.message,
                                    }
                                } else if(data&&data.confirm==='fail'){
                                    $scope.confirm={
                                        type:"damger",
                                        modalHeader: 'The picking reversals',
                                        message:"The picking reversals is failed!",
                                    }
                                } else {
                                    $scope.confirm={
                                        type:"danger",
                                        modalHeader: 'The picking reversals Fail',
                                        message:"Unknown error, confirmation is failed!",
                                    }
                                }
                                confirmSubmit.do($scope);
                            },function(err){
                                utilSvc.pageLoading("stop");
                                console.error(err);
                                $scope.confirm={
                                    type:"danger",
                                    modalHeader: 'The picking reversals Failed',
                                    message:err.data.message||"System error, The picking reversals is failed!",
                                }
                                confirmSubmit.do($scope);
                            }
                        ) 
            };
        } else {
            $scope.order={};    
            if (order&&order.error){ //in case order is NOT in valid
                utilSvc.addAlert(order.message, "fail", false);
            } else {
                if ($routeParams.TONumber)
                    utilSvc.addAlert("The Transfer order "+$routeParams.TONumber+" doesn't exist!", "fail", false);
            }
            $scope.submitForm = function() {
                $location.path("/fulfillment/picking-reversals/"+utilSvc.formalizeOrderNo($scope.order.TONumber));
            }
        }

    }])
 }())

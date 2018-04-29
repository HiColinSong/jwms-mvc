/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('rtgReceiptsCtrl', ['$scope','$location','$routeParams','order','utilSvc','bxService','constants','modalConfirmSubmit',
            function($scope,$location,$routeParams,order,utilSvc,apiSvc,constants,confirmSubmit){
                    $scope.sortType     = ''; // set the default sort type
                    $scope.sortReverse  = false;  // set the default sort order
                    $scope.searchItem   = '';     // set the default search/filter term

                    $scope.temp={};
                    $scope.info={};
                    $scope.categories=constants.categories;

        if (order&&order.orderNo&&(!order.status||order.status==='valid')){
                order.items=order.items||[]
                $scope.order=order;
                $scope.orderNo=order.orderNo;
                utilSvc.addAlert("The delivery order "+$routeParams.orderNo+" found", "success", true);

                // $scope.removeItem=function(sno){
                //     apiSvc.removeItemFromRtgDo({param1:$scope.orderNo,param2:sno}).$promise.then(
                //                 function(data){
                //                     if (data){
                //                         $scope.order=order=data;
                //                     } else {
                //                         utilSvc.addAlert("The item \""+sno+"\" failed to remove!", "fail", false);
                //                     }
                //                 },
                //                 function(err){
                //                     utilSvc.addAlert("The item "+sno+" failed to remove", "fail", false);
                //                 })
                // };

                $scope.confirmReceipt = function() {
                    apiSvc.checkOrderStatus({type:"rtgReceipts",param1:order.orderNo}).$promise.then(function(data){
                        if (data.status==="valid"){
                            apiSvc.confirmOperation({type:"rtgReceipts"},$scope.order).$promise.then(function(data){
                                if (data){
                                    $scope.confirm=data;
                                    confirmSubmit.do($scope);
                                }
                            },function(err){
                                console.err(err);
                            });
                        } else if(data.status==="invalid"){ //invalid status
                           $scope.confirm={
                                type:"danger",
                                message:"The Deliver order is invalid, operation failed!",
                                resetPath:"/rtgReceipts"
                            }
                            confirmSubmit.do($scope);
                        } else { //order not found
                            utilSvc.addAlert("The delivery order "+$routeParams.orderNo+" no longer exists!", "fail", false);
                        }
                    },function(err){
                        utilSvc.addAlert("Unknown issue!", "fail", false);
                        console.err(err);
                    })
                }

        } else {
            $scope.order={};    
            if (order&&order.orderNo){ //in case order is NOT in valide
                utilSvc.addAlert("The Delivery order "+order.orderNo+" is INVALID for this operation!", "warning", false);
            } else {
                if ($routeParams.orderNo)
                    utilSvc.addAlert("The Delivery order "+$routeParams.orderNo+" doesn't exist!", "fail", false);
            }
            $scope.submitForm = function() {
                $location.path("/receiving/rtgReceipts/"+$scope.order.orderNo);
            }
        }
    }])
 }())

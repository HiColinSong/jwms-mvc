/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('pickingCtrl', ['$scope','$rootScope','$location','$routeParams','$modal','order','utilSvc','bxService','constants','modalConfirmSubmit',
    		function($scope,$rootScope,$location,$routeParams,$modal,order,utilSvc,apiSvc,constants,confirmSubmit){
        			$scope.sortType     = 'serialNo'; // set the default sort type
                    $scope.sortReverse  = false;  // set the default sort order
                    $scope.searchItem   = '';     // set the default search/filter term

                    $scope.temp={};
                    $scope.info={};
                    $scope.categories=constants.categories;

        if (order&&order.orderNo&&(!order.status||order.status==='valid')){
                order.items=order.items||[];
                order.warehouseNo=$rootScope.authUser.warehouseNo;
                $scope.order=order;
                $scope.orderNo=order.toNo||order.doNo;
                utilSvc.addAlert("The transfer order "+$routeParams.orderNo+" found", "success", true);
                

                $scope.changePickingStatus=function(status){
                	apiSvc.setPickingStatus({param1:$scope.orderNo, param2:status})
                            .$promise.then(
                                function(data){
                                    if (data){
                                        // $scope.order.pickingStatus=data.pickingStatus;
                                        $scope.order.pickingStatus=order.pickingStatus=data.pickingStatus;
                                        if ($scope.order.pickingStatus==="start"){
                                            $scope.temp.showTab="serialNos";
                                        } else if (!$scope.order.pickingStatus){
                                            $scope.temp.showTab="picking";
                                        }
                                    } else {
                                        utilSvc.addAlert("Fail to change the picking status", "fail", false);
                                    }
                                },
                                function(err){
                                    utilSvc.addAlert("Fail to change the picking status", "fail", false);
                                }) 
                };

                $scope.confirmPick = function() {
                    apiSvc.checkOrderStatus({type:"picking",param1:order.orderNo}).$promise.then(function(data){
                        if (data.status==="valid"){
                            apiSvc.confirmOperation({type:"picking"},$scope.order).$promise.then(function(data){
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
                                message:"The transfer order is invalid, operation failed!",
                                resetPath:"/picking"
                            }
                            confirmSubmit.do($scope);
                        } else { //order not found
                            utilSvc.addAlert("The Deliver order "+$routeParams.orderNo+" no longer exists!", "fail", false);
                        }
                    },function(err){
                        utilSvc.addAlert("Unknown issue!", "fail", false);
                        console.err(err);
                    })
                }

        } else {
            $scope.order={};    
            if (order&&order.orderNo){ //in case order is NOT in valide
                utilSvc.addAlert("The Transfer order "+order.orderNo+" is INVALID for this operation!", "warning", false);
            } else {
                if ($routeParams.orderNo)
                    utilSvc.addAlert("The Transfer order "+$routeParams.orderNo+" doesn't exist!", "fail", false);
            }
            $scope.submitForm = function() {
                $location.path("/fulfillment/picking/"+$scope.order.orderNo);
            }
        }

    }])
 }())

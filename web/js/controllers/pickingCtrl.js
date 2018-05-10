/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('pickingCtrl', ['$scope','$rootScope','$location','$routeParams','$modal','order','utilSvc','bxService','modalConfirmSubmit',
    		function($scope,$rootScope,$location,$routeParams,$modal,order,utilSvc,apiSvc,confirmSubmit){


                    $scope.temp={};
                    $scope.info={};

        if (order&&order.TONumber&&(!order.PickConfirmStatus||order.PickConfirmStatus==='A')){
            utilSvc.addAlert("The transfer order "+$routeParams.TONumber+" found", "success", true);
            order.scannedItems=order.scannedItems||[];
            $scope.order=order;
            $scope.TONumber=order.TONumber;
                

                $scope.changePickingStatus=function(status){
                    var params={TONumber:$scope.TONumber}
                    params[status]=utilSvc.formatDate();
                    if ('Push2SAPStatus'===status){
                        params.Push2SAPStatus='C';
                        params.items=order.plannedItems;
                    }
                	apiSvc.setPickingStatus(params)
                            .$promise.then(
                                function(data){
                                    if (data){
                                        angular.extend($scope.order, data)
                                    } else {
                                        utilSvc.addAlert("Fail to change the picking status", "fail", false);
                                    }
                                },
                                function(err){
                                    if (err.data&&err.data.message)
                                        utilSvc.addAlert(err.data.message, "fail", false);
                                    else
                                        utilSvc.addAlert(JSON.stringify(err), "fail", false);
                                }) 
                };

                // $scope.confirmPick = function() {
                //     apiSvc.checkOrderStatus({type:"picking",param1:order.TONumber}).$promise.then(function(data){
                //         if (data.status==="valid"){
                //             apiSvc.confirmOperation({type:"picking"},$scope.order).$promise.then(function(data){
                //                 if (data){
                //                     $scope.confirm=data;
                //                     confirmSubmit.do($scope);
                //                 }
                //             },function(err){
                //                 console.err(err);
                //             });
                //         } else if(data.status==="invalid"){ //invalid status
                //            $scope.confirm={
                //                 type:"danger",
                //                 message:"The transfer order is invalid, operation failed!",
                //                 resetPath:"/picking"
                //             }
                //             confirmSubmit.do($scope);
                //         } else { //order not found
                //             utilSvc.addAlert("The Deliver order "+$routeParams.TONumber+" no longer exists!", "fail", false);
                //         }
                //     },function(err){
                //         utilSvc.addAlert("Unknown issue!", "fail", false);
                //         console.err(err);
                //     })
                // }

        } else {
            $scope.order={};    
            if (order&&order.error){ //in case order is NOT in valid
                utilSvc.addAlert(order.message, "fail", false);
            } else {
                if ($routeParams.TONumber)
                    utilSvc.addAlert("The Transfer order "+$routeParams.TONumber+" doesn't exist!", "fail", false);
            }
            $scope.submitForm = function() {
                $location.path("/fulfillment/picking/"+utilSvc.formalizeOrderNo($scope.order.TONumber));
            }
        }

    }])
 }())

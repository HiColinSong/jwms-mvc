/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('pickingCtrl', ['$scope','$rootScope','$location','$routeParams','$modal','order','utilSvc','bxService','modalConfirmSubmit',
    		function($scope,$rootScope,$location,$routeParams,$modal,order,utilSvc,apiSvc,confirmSubmit){


                    $scope.temp={};
                    $scope.info={};

        if (order&&order.TONumber){
            if (!order.PickConfirmStatus||order.PickConfirmStatus==='A'){
                utilSvc.addAlert("The transfer order "+$routeParams.TONumber+" found", "success", true);
            } else {
                utilSvc.addAlert("The transfer order "+$routeParams.TONumber+" has been confirmed", "warning", true);
            }
            order.scannedItems=order.scannedItems||[];
            $scope.order=order;
            $scope.TONumber=order.TONumber;
            apiSvc.getCustomerName({ShipToCustomer:order.ShipToCustomer}).$promise.
            then(function(data){
                order.ShipToCustomerName=data.customerName;
            },function(err){
                console.error(err);
            });
                

                $scope.changePickingStatus=function(status){
                    var params={TONumber:$scope.TONumber}
                    // params[status]=utilSvc.formatDate();
                    params[status]=utilSvc.formatDateTime();
                    if ('Push2SAPStatus'===status){
                        params.Push2SAPStatus='C';
                        params.items=order.plannedItems;
                    }
                    utilSvc.pageLoading("start");
                	apiSvc.setPickingStatus(params)
                            .$promise.then(
                                function(data){
                                    utilSvc.pageLoading("stop");
                                    if (data){
                                        angular.extend($scope.order, data)
                                    } else {
                                        utilSvc.addAlert("Fail to change the picking status", "fail", false);
                                    }
                                },
                                function(err){
                                    utilSvc.pageLoading("stop");
                                    if (err.data&&err.data.message)
                                        utilSvc.addAlert(err.data.message, "fail", false);
                                    else
                                        utilSvc.addAlert(JSON.stringify(err), "fail", false);
                                }) 
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
                $location.path("/fulfillment/picking/"+utilSvc.formalizeOrderNo($scope.order.TONumber));
            }
        }

    }])
 }())

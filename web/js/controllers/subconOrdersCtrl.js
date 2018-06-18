/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('subconOrdersCtrl', ['$scope','$location','$routeParams','$filter','utilSvc',
                'bxService','constants','modalConfirmSubmit','scanItemSvc','soundSvc',
            function($scope,$location,$routeParams,$filter,utilSvc,
                     apiSvc,constants,confirmSubmit,itemSvc,soundSvc){
            $scope.order = {};
            apiSvc.getSubconOrderList()
                .$promise.then(function(data){
                    $scope.subconOrders = data;
                },function(err){
                    console.log(err);
                })

                $scope.getWorkOrders = function() {
                    if ($scope.order.userInput){
                        let userInput = $scope.order.userInput;
                        topLoop:
                        for (let i = 0; i < $scope.subconOrders.length; i++) {
                            const so = $scope.subconOrders[i];
                            if (userInput===so.SubCOnPORefNo){
                                $scope.order.orderNo = so.SubCOnPORefNo;
                                break;
                            } else {
                                if (so.woNos&&so.woNos.length>0){
                                    for (let j = 0; j < so.woNos.length; j++) {
                                        const wo = so.woNos[j];
                                        if (userInput===wo){
                                            $scope.order.orderNo = so.SubCOnPORefNo;;
                                            break topLoop;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if ($scope.order.orderNo){
                        $location.path("/receiving/spoReceipts/"+$scope.order.orderNo);
                    } else {
                        utilSvc.addAlert('The Subcon Order doesn\'t exist!', "fail", false);
                    }
                }
    }])
 }())

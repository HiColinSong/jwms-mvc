/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('subconOrdersCtrl', ['$scope','$location','utilSvc','bxService',
            function($scope,$location,utilSvc,apiSvc){
            if ($location.url().match('spoLotRelease')){
                $scope.title = "Subcon PO Lot Release";
            } else if ($location.url().match('spoReceipts')){
                $scope.title = "Post Sterile Receipts";
            }
            $scope.order = {};
            utilSvc.pageLoading("start");
            apiSvc.getSubconOrderList()
                .$promise.then(function(data){
                    $scope.subconOrders = data;
                    utilSvc.pageLoading("stop");
                },function(err){
                    console.log(err);
                    utilSvc.pageLoading("stop");
                })

                $scope.getWorkOrders = function() {
                    if ($scope.order.userInput&&$scope.order.userInput.indexOf("|21")>-1){
                        $scope.order.orderNo=$scope.order.userInput;
                    } else if ($scope.order.userInput){
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
                                if (so.batchNoList&&so.batchNoList.length>0){
                                    for (let j = 0; j < so.batchNoList.length; j++) {
                                        const batchNo = so.batchNoList[j];
                                        if (userInput.indexOf(batchNo)>-1){
                                            $scope.order.orderNo = so.SubCOnPORefNo;;
                                            break topLoop;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if ($scope.order.orderNo){
                        $location.path($location.url()+"/"+$scope.order.orderNo);
                    } else {
                        utilSvc.addAlert('The Subcon Order doesn\'t exist!', "fail", false);
                    }
                }
    }])
 }());

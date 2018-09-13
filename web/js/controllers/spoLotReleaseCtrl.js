/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('spoLotReleaseCtrl', ['$scope','$rootScope','$routeParams','$interval','utilSvc','info',
                'bxService','constants','modalConfirmSubmit','$modal','scanItemSvc','soundSvc',
            function($scope,$rootScope,$routeParams,$interval,utilSvc,info,
                     apiSvc,constants,confirmSubmit,$modal,itemSvc,soundSvc){

                    // $scope.categories=constants.categories;
        $scope.temp = {showTab:"workOrders"};
        $scope.workOrders = info.workOrders;
        // $scope.bitList = info.bitPendingList;
        // $scope.qasList = info.qasPendingList;
        var calcSummary = function(){
            let su={};
            for (let i = 0; i < $scope.workOrders.length; i++) {
                const wo = $scope.workOrders[i];
                su.totalBITQty=(su.totalBITQty||0)+wo.totalBITQty;
                su.bitPlanQty=(su.bitPlanQty||0)+wo.bitPlanQty;
                su.scannedBITQty=(su.scannedBITQty||0)+wo.scannedBITQty;
                su.qaPlanQty=(su.qaPlanQty||0)+wo.qaPlanQty;
                su.scannedQaQty=(su.scannedQaQty||0)+wo.scannedQaQty;
                su.quarShptPlanQty=(su.quarShptPlanQty||0)+wo.quarShptPlanQty;
                su.scannedQuarQty=(su.scannedQuarQty||0)+wo.scannedQuarQty;
            }
            $scope.su=su;
        }
        calcSummary();


                $scope.lotRelease = function() {
                    utilSvc.pageLoading("start");
                    let releasedOrders=[];
                    for (let i = 0; i < $scope.workOrders.length; i++) {
                        const wo = $scope.workOrders[i];
                        if (wo.toRelease){
                            releasedOrders.push(wo.workOrder);
                        }
                    }
                    console.log("$scope.workOrders[0].SubConPoRefNo="+$scope.workOrders[0].SubConPoRefNo);
                    apiSvc.confirmOperation(
                        {type:"spoReceipts"},
                        {   orderNo:$scope.workOrders[0].subconPORefNo,
                            releasedOrders:releasedOrders,
                            confirmOn:utilSvc.formatDateTime()
                        }).$promise
                    .then(function(data){
                        utilSvc.pageLoading("stop");
                        if (data&&data.confirm==='success'){
                            $scope.confirm={
                                type:"success",
                                modalHeader: 'Subcon PO Confirmation Success',
                                message:"The Subcon PO Receipts is confirmed successfully!",
                                warningMsg:data.warningMsg
                            }
                            $scope.workOrders=data.workOrders;
                            $scope.checkLotRelease();
                        } else {
                            $scope.confirm={
                                type:"danger",
                                modalHeader: 'Subcon PO Confirmation Fail',
                                message:"Unknown error, confirmation is failed!",
                            }
                        }
                        confirmSubmit.do($scope);
                    },function(err){
                        utilSvc.pageLoading("stop");
                        console.error(err);
                        $scope.confirm={
                            type:"danger",
                            message:err.data.message||err.data[0].message||"System error, confirmation is failed!",
                        }
                        confirmSubmit.do($scope);
                    });
                }
               

        $scope.isLotRelease=false;
        $scope.checkLotRelease=function(){
            $scope.isLotRelease=false;
            for (let i = 0; i < $scope.workOrders.length; i++) {
                const wo = $scope.workOrders[i];
                if (wo.toRelease){
                    $scope.isLotRelease=true;
                    break;
                }
            }
            return;
        }
    }])
 }())

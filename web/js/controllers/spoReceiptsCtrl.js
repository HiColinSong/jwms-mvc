/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('spoReceiptsCtrl', ['$scope','$rootScope','$routeParams','$interval','utilSvc','info',
                'bxService','constants','modalConfirmSubmit','$modal','scanItemSvc','soundSvc',
            function($scope,$rootScope,$routeParams,$interval,utilSvc,info,
                     apiSvc,constants,confirmSubmit,$modal,itemSvc,soundSvc){

                    // $scope.categories=constants.categories;
        $scope.temp = {showTab:"workOrders",doNotConfirmForUnscan:false};
        $scope.type = "subcon";
        $scope.workOrders = info.workOrders;
        $scope.bitList = info.bitPendingList;
        $scope.qasList = info.qasPendingList;
        var calcSummary = function(){
            let su={};
            for (let i = 0; i < $scope.workOrders.length; i++) {
                const wo = $scope.workOrders[i];
                su.planSGWQty=(su.planSGWQty||0)+wo.nPlanSGWQty;
                su.rcptSGWQty=(su.rcptSGWQty||0)+wo.nRcptSGWQty;
                su.rcptSGWQtyIncr=(su.rcptSGWQtyIncr||0)+wo.nRcptSGWQtyIncr;
                su.planSGQQty=(su.planSGQQty||0)+wo.nPlanSGQQty;
                su.rcptSGQQty=(su.rcptSGQQty||0)+wo.nRcptSGQQty;
                su.rcptSGQQtyIncr=(su.rcptSGQQtyIncr||0)+wo.nRcptSGQQtyIncr;
            }
            $scope.su=su;
        }
        calcSummary();

        $scope.barcode = itemSvc.getBarcodeObj();
        let waitForUser = $interval(function() {
            if ($rootScope.authUser) {
                $interval.cancel(waitForUser);
                if ($rootScope.authUser.UserRole.indexOf('qa')!==-1){
                    $scope.barcode.isQaSample=true; 
                }
            }
          }, 10);

        apiSvc.getQASampleCategoryList().$promise.then(function(data){
            $scope.qaSampleCategoryList = data;
        },function(err){
            console.error(JSON.stringify(err,null,2));
        })
        $scope.refresh=function(){
            utilSvc.pageLoading("start");
            apiSvc.getSubconWorkOrderInfo({orderNo:$scope.workOrders[0].SubConPoRefNo})
                            .$promise.then(function(data){
                                if (data){
                                    for (let i = 0; i < data.workOrders.length; i++) {
                                        const updatedWo = data.workOrders[i];
                                        const previousWo = $scope.workOrders[i];
                                        updatedWo.nRcptSGWQtyIncr=updatedWo.nRcptSGWQty-previousWo.nRcptSGWQty;
                                        updatedWo.nRcptSGQQtyIncr=updatedWo.nRcptSGQQty-previousWo.nRcptSGQQty;
                                    }
                                    $scope.workOrders = data.workOrders;
                                    calcSummary();
                                    // $scope.bitList = data.bitPendingList;
                                    // $scope.qasList = data.qasPendingList;
                                }
                                utilSvc.pageLoading("stop");
                            },function(err){
                                if (err.data&&err.data.message){
                                    utilSvc.addAlert(err.data.message, "fail", true);
                                }
                                utilSvc.pageLoading("stop");
                            })
        }
                $scope.findItem=function(){
                    $scope.bitList=undefined;
                    $scope.qaList=undefined;
                    var param = {sFullScanCode:$scope.barcode.barcode1,orderNo:$routeParams.orderNo};
                    param.sReturnToTarget = ($scope.barcode.isQaSample)?"SGQ":"SGW";
                    param.sOverWritePreviousScan = $scope.barcode.sOverWritePreviousScan;
                    param.statusId=$scope.barcode.statusId;
                    if ($scope.barcode.isQaSample){
                        if ($scope.barcode.qaCategory){
                            param.sQACategory = $scope.barcode.qaCategory.QASampleID
                        } else {
                            utilSvc.addAlert('Please select QA Sample Category', "fail", false);
                            return;
                        }
                    }
                    apiSvc.updateSubconReturn(param).$promise.then(
                        function(data){
                            // console.log(JSON.stringify(data,null,2));
                            soundSvc.play("goodSound");
                            // $scope.workOrders = data.workOrders;
                            $scope.bitList = [];
                            $scope.qasList = [];
                            $scope.barcode.reset();
                        },function(err){
                            if (err.data&&err.data.error&&err.data.error.class===14&&$scope.temp.doNotConfirmForUnscan){
                                $scope.barcode.sOverWritePreviousScan = "X";
                                $scope.barcode.statusId = 5;
                                $scope.findItem();
                                return;
                            }
                            soundSvc.play("badSound");
                            if (err.data&&err.data.error&&(err.data.error.class===15||err.data.error.class===14)){
                                $scope.confirmMessage = [];
                                $scope.confirmMessage[0]=err.data.message.trim()
                                $scope.errClass=err.data.error.class;
                                var modalInstance = $modal.open({
                                    templateUrl: 'partials/confirm-modal.html',
                                    scope: $scope
                                });
                                $scope.yes = function() {
                                    modalInstance.close("yes");
                                    $scope.barcode.sOverWritePreviousScan = "X";
                                    if (err.data.error.class===14)
                                        $scope.barcode.statusId = 5; //unscan the item
                                    $scope.findItem();
                                    return;
                                }
                            } else{
                            // } else if (err.data&&err.data.error.class===16){
                                $scope.barcode.errMsg=[];
                                $scope.barcode.errMsg.push(err.data.message.trim()||"Unknown error");
                                return;
                            }
                        })

                }

        $scope.refreshScanList=function(ShipToTarget){
            utilSvc.pageLoading("start");
            apiSvc.getSubconScanList({subconPO:$scope.workOrders[0].SubConPoRefNo,ShipToTarget:ShipToTarget})
                            .$promise.then(function(data){
                                if (data){
                                    if (ShipToTarget==='SGW'){
                                        $scope.bitList = data.scanList;
                                    } else {
                                        $scope.qasList = data.scanList;
                                    }
                                }
                                utilSvc.pageLoading("stop");
                            },function(err){
                                if (err.data&&err.data.message){
                                    utilSvc.addAlert(err.data.message, "fail", true);
                                }
                                utilSvc.pageLoading("stop");
                            })
        }
    }])
 }());

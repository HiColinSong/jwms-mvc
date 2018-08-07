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
        $scope.temp = {showTab:"workOrders"};
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
                    var param = {sFullScanCode:$scope.barcode.barcode1,orderNo:$routeParams.orderNo};
                    param.sReturnToTarget = ($scope.barcode.isQaSample)?"SGQ":"SGW";
                    param.sOverWritePreviousScan = $scope.barcode.sOverWritePreviousScan;
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
                            soundSvc.play("badSound");
                            let errMsg = err.data.message.trim();
                            
                            //overwrite the scan
                            let sourceTarget,sourceQACategory,regex,requiredTarget,requiredQACategory;
                            if (errMsg){
                                sourceTarget = (errMsg.match(/SG[A-Z]/i))?errMsg.match(/SG[A-Z]/i)[0]:undefined;
                                sourceQACategory=errMsg.match(/00[0-9]/i);
                                sourceQACategory=(sourceQACategory)?sourceQACategory[0]:undefined;
                                requiredTarget=($scope.barcode.isQaSample)?"SGQ":"SGW";
                                requiredQACategory = ($scope.barcode.qaCategory)?$scope.barcode.qaCategory.QASampleID:undefined;
                                if ((sourceTarget === requiredTarget&&sourceQACategory&&sourceQACategory!==requiredQACategory)||
                                      (sourceTarget&&sourceTarget !== requiredTarget)){
                                        let msg1="This serial No is already assgined to ";
                                        let msg2 = (sourceTarget==="SGW")?"BIT Warehouse":"QA Sample";
                                        let msg3 = (sourceQACategory)?utilSvc.findItemById(sourceQACategory,$scope.qaSampleCategoryList,"QASampleID")["QASampleDesc"]+"\"":"";
                                        let msg4 = (msg3)?"  in Category of \""+msg3+"\"":".";
                                        let msg5 = "Are you sure move to ";
                                        let msg6 = (requiredTarget==="SGW")?"BIT Warehouse":"QA Sample in Category of \"";
                                        let msg7 = ($scope.barcode.isQaSample&&requiredQACategory)?utilSvc.findItemById(requiredQACategory,$scope.qaSampleCategoryList,"QASampleID")["QASampleDesc"]+"\"":"";
                                        let msg8 = "?";
                                        $scope.confirmMessage = [];
                                        $scope.confirmMessage[0] = [msg1,msg2,msg4].join("");
                                        $scope.confirmMessage[1] = [msg5,msg6,msg7,msg8].join("");
                                        var modalInstance = $modal.open({
                                            templateUrl: 'partials/confirm-modal.html',
                                            scope: $scope
                                        });
                                        $scope.yes = function() {
                                            modalInstance.close("yes");
                                            $scope.barcode.sOverWritePreviousScan = "X";
                                            $scope.findItem();
                                            return;
                                        }

                                } else {
                                    $scope.barcode.errMsg=[];
                                    $scope.barcode.errMsg.push(err.data.message.trim()||"Unknow error");
                                    return;
                                }
                            }
                        })

                }
                $scope.confirmReceipt = function() {
                    utilSvc.pageLoading("start");
                    apiSvc.confirmOperation({type:"spoReceipts"},{orderNo:$scope.workOrders[0].SubConPoRefNo}).$promise
                    .then(function(data){
                        utilSvc.pageLoading("stop");
                        if (data&&data.confirm==='success'){
                            $scope.confirm={
                                type:"success",
                                modalHeader: 'Subcon PO Confirmation Success',
                                message:"The Subcon PO Receipts is confirmed successfully!",
                                resetPath:"/receiving"
                            }
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
                $scope.dorder={};
                $scope.partialRelease = function() {
                    utilSvc.pageLoading("start");
                    apiSvc.partialRelease({orderNo:utilSvc.formalizeOrderNo($scope.dorder.DONumber),subconPO:$scope.workOrders[0].SubConPoRefNo}).$promise
                    .then(function(data){
                        utilSvc.pageLoading("stop");
                        if (data&&data.confirm==='success'){
                            $scope.confirm={
                                type:"success",
                                modalHeader: 'Partial Release Confirmation Success',
                                message:"The Partial Release is confirmed successfully!",
                                resetPath:"/receiving"
                            }
                        } else {
                            $scope.confirm={
                                type:"danger",
                                modalHeader: 'Partial Release Confirmation Fail',
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

        $scope.refreshPendList=function(ShipToTarget){
            utilSvc.pageLoading("start");
            apiSvc.getSubconPendingList({subconPO:$scope.workOrders[0].SubConPoRefNo,ShipToTarget:ShipToTarget})
                            .$promise.then(function(data){
                                if (data){
                                    if (ShipToTarget==='SGW'){
                                        $scope.bitList = data.pendingList;
                                    } else {
                                        $scope.qasList = data.pendingList;
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

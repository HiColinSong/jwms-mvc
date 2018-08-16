/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('qrsmtPrepackCtrl', ['$scope', '$controller', 'orders','utilSvc','bxService','modalConfirmSubmit','soundSvc',
        function ($scope, $controller,orders,utilSvc,apiSvc,confirmSubmit,soundSvc){
        let setOrder=function(){
            order.DONumber=order.qsNo;
            $controller('packingCtrl', {$scope: $scope,order:order})
            $scope.type="qrsmt"
            $scope.findItem=function(){
                $scope.temp.showHU.scannnedItems=undefined;
                    $scope.barcode.parseBarcode();
                    if (!$scope.barcode.valid||!$scope.barcode.infoComplete){
                        soundSvc.play("badSound");
                        return;
                    }
                //try find the batch in plannedItems
                let found=false;
                for (let i = 0; i < order.plannedItems.length; i++) {
                    const item = order.plannedItems[i];
                    if (item.BatchNo===$scope.barcode.batchNo){
                        found=true;
                        break;
                    }
                }
                if (!found){
                    $scope.barcode.errMsg.push("Error:Item doesn't exist!")
                    soundSvc.play("badSound");
                    return;
                }

                let params={};
                params.qsNo=order.qsNo;
                params.scannedOn=utilSvc.formatDateTime();
                params.sFullScanCode=$scope.barcode.barcode1;
                params.HUNumber=$scope.temp.showHU.HUNumber;
                params.batchNo=$scope.barcode.batchNo;
    
                apiSvc.insertScanItem({type:$scope.type},params).$promise.then(
                    function(data){
                        // console.log(data);
                        $scope.barcode.errMsg=[]
                        if (data&&data.length>0&&data[0].error){
                            $scope.barcode.errMsg.push(data[0].message.originalError.info.message)
                            soundSvc.play("badSound");
                        }
                        else {
                            $scope.barcode.reset();
                            soundSvc.play("goodSound");
                        }
                    },
                    function(err){
                        $scope.barcode.errMsg=[]
                        if (err.data&&err.data.length>0&&err.data[0].error)
                            err=err.data[0].message.originalError.info;
                        $scope.barcode.errMsg.push(err.message)
                        soundSvc.play("badSound");
                    })
            };
    
    
            $scope.removeItem=function(item){
                apiSvc.removeScanItem({type:$scope.type},{orderNo:order.qsNo,fullScanCode:item.FullScanCode}).$promise.
                    then(function(data){
                        if (data&&data.length>0&&data[0].error)
                            console.error(data[0].message.originalError.info.message);
                        else 
                            $scope.order.HUList = data;
                    },function(error){
                        console.error(error);
                    }
                )
            }
    
            $scope.confirmPacking = function() {
                utilSvc.pageLoading("start");
                apiSvc.confirmOperation({type:$scope.type},
                    {qsNo:order.qsNo,
                     SubconPORefNo:order.subconPORefNo,
                     prepackConfirmOn:utilSvc.formatDateTime()}).$promise.
                then(function(data){
                    utilSvc.pageLoading("stop");
                    $scope.confirm=undefined
                    if (data&&data.confirm==='success'&&data.status&&data.status.length>0){
                        // $scope.confirm={
                        //     type:"success",
                        //     modalHeader: 'Pre-Packing Confirmation Success',
                        //     message:"The Pre-Packing order is confirmed successfully!"
                        // }
                        utilSvc.addAlert("The Pre-Packing order is confirmed successfully!", "success", true);
                        $scope.order.prepackConfirmOn=data.status[0].prepackConfirmOn;
                    } else if(data&&data.error&&data.message){
                        $scope.confirm={
                            type:"danger",
                            modalHeader: 'Pre-Packing Confirmation Fail',
                            message:data.message,
                        }
                    } else if(data&&data.confirm==='fail'){
                        $scope.confirm={
                            type:"danger",
                            modalHeader: 'Pre-Packing Confirmation Fail',
                            message:"The delivery order is invalid, confirmation is failed!",
                        }
                    } else {
                        $scope.confirm={
                            type:"danger",
                            modalHeader: 'Pre-Packing Confirmation Fail',
                            message:"Unknown error, confirmation is failed!",
                        }
                    }
                    if ($scope.confirm)
                        confirmSubmit.do($scope);
                },function(err){
                    utilSvc.pageLoading("stop");
                    console.error(err);
                    $scope.confirm={
                        type:"danger",
                        message:err.data.message||"System error, confirmation is failed!",
                    }
                    confirmSubmit.do($scope);
                });
            }
            $scope.sapDo={};
            $scope.linkToSapDo = function() {
                utilSvc.pageLoading("start");
                apiSvc.linkToSapDo({DONumber:utilSvc.formalizeOrderNo($scope.sapDo.DONumber),subconPORefNo:order.subconPORefNo,qsNo:order.qsNo}).$promise.
                then(function(data){
                    utilSvc.pageLoading("stop");
                    if (data&&data.confirm==='success'){
                        $scope.confirm={
                            type:"success",
                            modalHeader: 'Linked to SAP DO Success',
                            message:"The Pre-Packing order is linked to SAP DO successfully!"
                        }
                        $scope.order.linkedDONumber=utilSvc.formalizeOrderNo($scope.sapDo.DONumber);
                        $scope.order.linkSapOrder=$scope.sapDo.DONumber;
                    } else if(data&&data.error&&data.message){
                        $scope.confirm={
                            type:"danger",
                            modalHeader: 'Pre-Packing Link Fail',
                            message:data.message,
                        }
                    } else if(data&&data.confirm==='fail'){
                        $scope.confirm={
                            type:"danger",
                            modalHeader: 'Pre-Packing Link Fail',
                            message:"The Pre-Packing order is failed to link to SAP DO",
                        }
                    } else {
                        $scope.confirm={
                            type:"danger",
                            modalHeader: 'Pre-Packing Link Fail',
                            message:"Unknown error, Link is failed!",
                        }
                    }
                    confirmSubmit.do($scope);
                },function(err){
                    utilSvc.pageLoading("stop");
                    console.error(err);
                    $scope.confirm={
                        type:"danger",
                        message:err.data.message||"System error, Link to SAP  is failed!",
                    }
                    confirmSubmit.do($scope);
                });
            }
            $scope.unlinkSapDo = function() {
                utilSvc.pageLoading("start");
                apiSvc.unlinkSapDo({DONumber:order.linkedDONumber,qsNo:order.qsNo}).$promise.
                then(function(data){
                    utilSvc.pageLoading("stop");
                    if (data&&data.confirm==='success'){
                        $scope.confirm={
                            type:"success",
                            modalHeader: 'Unlinked to SAP DO Success',
                            message:"The Pre-Packing order is unlinked to SAP DO successfully!"
                        }
                        $scope.order.linkedDONumber="";
                        $scope.order.linkSapOrder=undefined;
                    } else if(data&&data.error&&data.message){
                        $scope.confirm={
                            type:"danger",
                            modalHeader: 'Pre-Packing Unlink Fail',
                            message:data.message,
                        }
                    } else if(data&&data.confirm==='fail'){
                        $scope.confirm={
                            type:"danger",
                            modalHeader: 'Pre-Packing Unlink Fail',
                            message:"The Pre-Packing order is failed to unlink to SAP DO",
                        }
                    } else {
                        $scope.confirm={
                            type:"danger",
                            modalHeader: 'Pre-Packing Unlink Fail',
                            message:"Unknown error, Unlink is failed!",
                        }
                    }
                    confirmSubmit.do($scope);
                },function(err){
                    utilSvc.pageLoading("stop");
                    console.error(err);
                    $scope.confirm={
                        type:"danger",
                        message:err.data.message||"System error, Link to SAP  is failed!",
                    }
                    confirmSubmit.do($scope);
                });
            }
        }
        let order;
        $scope.orders=orders;
        if (orders.length===1){
            order=orders[0];
            setOrder();
        } else {
            $scope.selectOrder=function(idx){
                order=orders[idx];
                setOrder();
            }
        }
     }])
 }())

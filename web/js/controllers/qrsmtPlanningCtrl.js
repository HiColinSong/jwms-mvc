/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('qrsmtPlanningCtrl', ['$scope','$rootScope','$routeParams','$interval','utilSvc','info',
                'bxService','modalConfirmSubmit','$modal','scanItemSvc','soundSvc',
            function($scope,$rootScope,$routeParams,$interval,utilSvc,info,
                     apiSvc,confirmSubmit,$modal,itemSvc,soundSvc){

                    // $scope.categories=constants.categories;
        $scope.workOrders = info.workOrders;
        let barcode = itemSvc.getBarcodeObj();
        var calcSummary = function(){
            let su={};
            for (let i = 0; i < $scope.workOrders.length; i++) {
                barcode.reset();
                const wo = $scope.workOrders[i];
                barcode.barcode1=wo.FullScanCode
                barcode.parseBarcode();
                wo.totalQty=wo.nPlanSGWQty+wo.nPlanQuarQty;
                wo.MaterialCode="BMX-4028";
                wo.EANCode=barcode.eanCode;
                wo.BatchNo=barcode.batchNo;

                su.totalQty=(su.totalQty||0)+wo.totalQty;
                su.planSGWQty=(su.planSGWQty||0)+wo.nPlanSGWQty;
                su.planQuarQty=(su.planQuarQty||0)+wo.nPlanQuarQty;
                su.scanSGWQty=(su.scanSGWQty||0)+wo.nRcptSGWQty;
                su.scanQuarQty=(su.scanQuarQty||0)+wo.nRcptQuarQty;
            }
            $scope.su=su;
        }
        calcSummary();
        $scope.reCalulate=function(order){
            order.nPlanQuarQty=order.nPlanQuarQty||0
            order.nPlanQuarQty=Math.min(order.nPlanQuarQty,order.totalQty-(order.nRcptSGWQty));
            order.nPlanQuarQty=Math.max(order.nRcptQuarQty,order.nPlanQuarQty);
            order.nPlanSGWQty = order.totalQty-order.nPlanQuarQty;
            calcSummary();
        }



               
                $scope.saveQuarShptPlan = function() {
                    utilSvc.pageLoading("start");
                    apiSvc.saveQuarShptPlan({workOrders:$scope.workOrders}).$promise
                    .then(function(data){
                        utilSvc.pageLoading("stop");
                        if (data&&data.confirm==='success'){
                            utilSvc.addAlert("The Quarantine Shipment Plan is saved successfully!", "success", true);
                            // $scope.confirm={
                            //     type:"success",
                            //     modalHeader: 'Quarantine Shipment Plan Save Success',
                            //     message:"The Quarantine Shipment Plan is saved successfully!"
                            // }
                        } 
                        // confirmSubmit.do($scope);
                        utilSvc.pageLoading("stop");
                    },function(err){
                        utilSvc.pageLoading("stop");
                        console.error(err);
                        $scope.confirm={
                            type:"danger",
                            message:err.data.message||err.data[0].message||"System error, Operation is failed!",
                        }
                        confirmSubmit.do($scope);
                    });
                }
               

       
        
    }])
 }())

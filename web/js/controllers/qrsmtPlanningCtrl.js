/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('qrsmtPlanningCtrl', ['$scope','$rootScope','$routeParams','$interval','utilSvc','plans',
                'bxService','modalConfirmSubmit','$modal','scanItemSvc','soundSvc',
            function($scope,$rootScope,$routeParams,$interval,utilSvc,plans,
                     apiSvc,confirmSubmit,$modal,itemSvc,soundSvc){

                    // $scope.categories=constants.categories;
        $scope.previousPlans = plans.previousPlans;
        $scope.plan = plans.currentPlan;
        // let barcode = itemSvc.getBarcodeObj();
        var calcSummary = function(){
            let su={};
            for (let i = 0; i < $scope.plan.workOrders.length; i++) {
                const wo = $scope.plan.workOrders[i];

                su.totalBITQty=(su.totalBITQty||0)+wo.totalBITQty;
                su.availbleBITQty=(su.availbleBITQty||0)+wo.availbleBITQty;
                su.planQty=(su.planQty||0)+wo.planQty;
                su.scannedBITQty=(su.scannedBITQty||0)+wo.scannedBITQty;
                su.scannedQuarQty=(su.scannedQuarQty||0)+wo.scannedQuarQty;
            }
            $scope.su=su;
        }
        calcSummary();
        let totalQtyFromPreviousPlans=(function(ppls){
            let ret={};
            for (let i = 0; i < ppls.length; i++) {
                const wos = ppls[i].workOrders;
                for (let j = 0; j < wos.length; j++) {
                    const wo = wos[j];
                    ret[wo.workOrder]=ret[wo.workOrder]||0;
                    ret[wo.workOrder]+=(wo.planQty||0);
                }
            }
            return ret;
        })(plans.previousPlans);
        $scope.reCalulate=function(order){
            let maxQty=order.totalBITQty-order.scannedBITQty-(totalQtyFromPreviousPlans[order.workOrder]||0);
            order.planQty=order.planQty||0
            order.planQty=Math.min(order.planQty,maxQty);
            order.planQty=Math.max(order.scannedQuarQty,order.planQty);
            order.availbleBITQty = order.totalBITQty-order.planQty-(totalQtyFromPreviousPlans[order.workOrder]||0);
            calcSummary();
        }



               
                $scope.saveQuarShptPlan = function() {
                    let submitPlan={
                        qsNo:$scope.plan.qsNo,
                        subconPORefNo:$scope.plan.subconPORefNo,
                        planOn:utilSvc.formatDateTime(),
                        workOrders:[]};
                    for (let i = 0; i < $scope.plan.workOrders.length; i++) {
                        const wo = $scope.plan.workOrders[i];
                        if (wo.planQty>0){
                            submitPlan.workOrders.push({
                                workOrder:wo.workOrder,
                                batchNo:wo.batchNo,
                                planQty:wo.planQty
                            })
                        }
                    }
                    utilSvc.pageLoading("start");
                    apiSvc.saveQuarShptPlan({plan:submitPlan}).$promise
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
                        utilSvc.addAlert("The Quarantine Shipment Plan is failed to save:"+(err.data.message||err.data[0].message||"System error, Operation is failed!"), "danger", false);
                        // $scope.confirm={
                        //     type:"danger",
                        //     message:err.data.message||err.data[0].message||"System error, Operation is failed!",
                        // }
                        // confirmSubmit.do($scope);
                    });
                }
               

       
        
    }])
 }())

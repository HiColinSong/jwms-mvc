/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('reservationCtrl', ['$scope','$rootScope','$location','$routeParams','$modal','resvDoc','utilSvc','bxService','modalConfirmSubmit','scanItemSvc','soundSvc',
    		function($scope,$rootScope,$location,$routeParams,$modal,resvDoc,utilSvc,apiSvc,confirmSubmit,itemSvc,soundSvc){

        $scope.temp={};
        if (resvDoc&&resvDoc.ResvNo){
            if (!resvDoc.ResvStatus||resvDoc.ResvStatus==='X'){
                utilSvc.addAlert("The reservation "+$routeParams.resvNo+" found", "success", true);
            } else {
                utilSvc.addAlert("The reservation "+$routeParams.resvNo+" has been confirmed", "warning", true);
            }
            resvDoc.scannedItems=resvDoc.scannedItems||[];
            $scope.resvDoc=resvDoc;
            $scope.ResvNo=resvDoc.ResvNo;
            $scope.itemNoFieldName = "ResvItemNumber";
            $scope.type = "reservation";
            $scope.barcode = itemSvc.getBarcodeObj();
            
            $scope.confirmReservation = function() {
                //check if any of items is selected for posting
                let posting = false;
                let postingItemsIndexes = [];
                for (let i = 0; i < $scope.resvDoc.plannedItems.length; i++) {
                    const plannedItem = $scope.resvDoc.plannedItems[i];
                    if (plannedItem.posting&&!plannedItem.ResvStatus){
                        postingItemsIndexes.push(i);
                    }
                }
                if (postingItemsIndexes.length===0){
                    utilSvc.addAlert("Please select posting item", "danger", true);
                    return;
                }

                utilSvc.pageLoading("start");
                apiSvc.confirmOperation({type:"reservation"},{resvNo:$scope.resvDoc.ResvNo,postingItemsIndexes:postingItemsIndexes,postedOn:utilSvc.formatDate()}).$promise.
                then(function(data){
                    utilSvc.pageLoading("stop");
                    if (data&&data.confirm==='success'){
                        $scope.confirm={
                            type:"success",
                            modalHeader: 'Reservation Confirmation Success',
                            message:"The reservation Posting is successfully done!"
                            // reload doc to update the status
                        }
                        apiSvc.getReservationDoc(
                            {resvNo:resvDoc.ResvNo}
                        ).$promise.then(function(data){
                            resvDoc.plannedItems=data.plannedItems;
                            itemSvc.calculateScannedQty(resvDoc.scannedItems,resvDoc.plannedItems,"ResvItemNumber","Quantity");
                        },function(err){
                            console.log(err);
                        })     
                        
                    } else if(data&&data.error&&data.message){
                        $scope.confirm={
                            type:"danger",
                            modalHeader: 'Reservation Confirmation Fail',
                            message:data.message,
                        }
                    } else if(data&&data.confirm==='fail'){
                        $scope.confirm={
                            type:"danger",
                            modalHeader: 'Reservation Confirmation Fail',
                            message:"The reservation is invalid, confirmation is failed!",
                        }
                    } else {
                        $scope.confirm={
                            type:"danger",
                            modalHeader: 'Reservation Confirmation Fail',
                            message:"Unknown error, confirmation is failed!",
                        }
                    }
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
               
        } else {
            $scope.resvDoc={};    
            if (resvDoc&&resvDoc.error){ //in case resvDoc is NOT in valid
                utilSvc.addAlert(resvDoc.message, "fail", false);
            } else {
                if ($routeParams.ResvNo)
                    utilSvc.addAlert("The reservation "+$routeParams.ResvNo+" doesn't exist!", "fail", false);
            }
            $scope.submitForm = function() {
                $location.path("/fulfillment/reservation/"+utilSvc.formalizeOrderNo($scope.resvDoc.ResvNo));
            }
        }

    }])
 }());

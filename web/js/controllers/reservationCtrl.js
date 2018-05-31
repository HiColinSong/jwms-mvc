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
 }())

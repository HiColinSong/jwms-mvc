/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('spoReceiptsCtrl', ['$scope','$location','$routeParams','utilSvc','bxService','constants','modalConfirmSubmit',
    		function($scope,$location,$routeParams,utilSvc,apiSvc,constants,confirmSubmit){
                    // $scope.sortType     = 'serialNo'; // set the default sort type
                    // $scope.sortReverse  = false;  // set the default sort order
                    // $scope.searchItem   = '';     // set the default search/filter term

                    // $scope.temp={};
                    $scope.receipts={};
                    $scope.categories=constants.categories;

        if ($routeParams.categoryId){
                    $scope.info={};
                    $scope.receipts.categoryId=$routeParams.categoryId;
                    $scope.receipts.items=[];
                
                $scope.confirmReceipt = function() {
                    apiSvc.confirmOperation({type:"spoReceipts"},$scope.receipts).$promise.then(function(data){
                                if (data){
                                    $scope.confirm=data;
                                    confirmSubmit.do($scope);
                                }
                            },function(err){
                                console.err(err);
                            });
                    // apiSvc.checkOrderStatus({type:"spoReceipts",param1:order.orderNo}).$promise.then(function(data){
                    //     if (data.status==="valid"){
                    //         apiSvc.confirmOperation({type:"spoReceipts"},$scope.order).$promise.then(function(data){
                    //             if (data){
                    //                 $scope.confirm=data;
                    //                 confirmSubmit.do($scope);
                    //             }
                    //         },function(err){
                    //             console.err(err);
                    //         });
                    //     } else if(data.status==="invalid"){ //invalid status
                    //        $scope.confirm={
                    //             type:"danger",
                    //             message:"The Subcon order is invalid, operation failed!",
                    //             resetPath:"/spoReceipts/"
                    //         }
                    //         confirmSubmit.do($scope);
                    //     } else { //order not found
                    //         utilSvc.addAlert("The Subcon Purchase order "+$routeParams.orderNo+" no longer exists!", "fail", false);
                    //     }
                    // },function(err){
                    //     utilSvc.addAlert("Unknown issue!", "fail", false);
                    //     console.err(err);
                    // })
                }
        } else {
            $scope.scanReceipt = function(categoryId) {
                $location.path("/receiving/spoReceipts/"+categoryId);
            }
        }
    }])
 }())

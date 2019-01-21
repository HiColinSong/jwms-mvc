/*jm - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('jm.controllers')
    .controller('copyPromotionDiscountCtrl', ['$scope','$rootScope', '$modalInstance','utilSvc','jmService','productTypeList','constants',
    	 function($scope,$rootScope,$modalInstance,utilSvc,apiSvc,productTypeList,constants){
             $scope.productTypeList=productTypeList;

             $scope.uniqueValidation=function(){
                $scope.duplicateUserID=false;
                if ($scope.promotionDiscount.Date != '' && $scope.promotionDiscount.DateTarget != ''){
                    if($scope.promotionDiscount.Date.getTime() == $scope.promotionDiscount.DateTarget.getTime()){
                        $scope.duplicateUserID=true;
                    }
                }
            }
    	 	$scope.submit=function(){
                $rootScope.dateQuery = utilSvc.formatDate($scope.promotionDiscount.DateTarget);
                $scope.promotionDiscount.maintainerName = $rootScope.authUser.userName;
                $scope.promotionDiscount.year = $scope.promotionDiscount.Date.getFullYear();
                $scope.promotionDiscount.month = $scope.promotionDiscount.Date.getMonth()+1;
                $scope.promotionDiscount.yearTarget = $scope.promotionDiscount.DateTarget.getFullYear();
                $scope.promotionDiscount.monthTarget = $scope.promotionDiscount.DateTarget.getMonth()+1;
                apiSvc.copyPromotionDiscount({promotionDiscount:$scope.promotionDiscount})
                .$promise.then(function(promotionDiscountList){
                    if (promotionDiscountList){
                        $modalInstance.close(promotionDiscountList);
                    } else {
                        utilSvc.addAlert("The Operation failed!", "fail", false);
                    }
                },
                function(err){
                    utilSvc.addAlert("The operation failed!", "fail", false);
                })
             }
    	 	$scope.reset=function(){
                $scope.promotionDiscount={};
                $scope.promotionDiscount.ProductTypeName='';
                $scope.promotionDiscount.DateTarget='';
                $scope.promotionDiscount.Date='';
             }
             $scope.reset();
    }])
 }());

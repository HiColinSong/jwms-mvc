/*jm - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('jm.controllers')
    .controller('copyBusinessPriceCtrl', ['$scope','$rootScope', '$modalInstance','utilSvc','jmService','productTypeList','constants',
    	 function($scope,$rootScope,$modalInstance,utilSvc,apiSvc,productTypeList,constants){
             $scope.productTypeList=productTypeList;

             $scope.uniqueValidation=function(){
                $scope.duplicateUserID=false;
                if ($scope.businessPrice.Date != '' && $scope.businessPrice.DateTarget != ''){
                    if($scope.businessPrice.Date.getTime() == $scope.businessPrice.DateTarget.getTime()){
                        $scope.duplicateUserID=true;
                    }
                }
            }
    	 	$scope.submit=function(){
                $rootScope.dateQuery = utilSvc.formatDate($scope.businessPrice.DateTarget);
                $scope.businessPrice.maintainerName = $rootScope.authUser.userName;
                $scope.businessPrice.year = $scope.businessPrice.Date.getFullYear();
                $scope.businessPrice.month = $scope.businessPrice.Date.getMonth()+1;
                $scope.businessPrice.yearTarget = $scope.businessPrice.DateTarget.getFullYear();
                $scope.businessPrice.monthTarget = $scope.businessPrice.DateTarget.getMonth()+1;
                apiSvc.copyBusinessPrice({businessPrice:$scope.businessPrice})
                .$promise.then(function(businessPriceList){
                    if (businessPriceList){
                        $modalInstance.close(businessPriceList);
                    } else {
                        utilSvc.addAlert("The Operation failed!", "fail", false);
                    }
                },
                function(err){
                    utilSvc.addAlert("The operation failed!", "fail", false);
                })
             }
    	 	$scope.reset=function(){
                $scope.businessPrice={};
                $scope.businessPrice.ProductTypeName='';
                $scope.businessPrice.DateTarget='';
                $scope.businessPrice.Date='';
             }
             $scope.reset();
    }])
 }());

/*jm - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('jm.controllers')
    .controller('copySaleForcastCtrl', ['$scope','$rootScope', '$modalInstance','utilSvc','jmService','productTypeList','constants',
    	 function($scope,$rootScope,$modalInstance,utilSvc,apiSvc,productTypeList,constants){
             $scope.productTypeList=productTypeList;

             $scope.uniqueValidation=function(){
                $scope.duplicateUserID=false;
                if ($scope.saleForecast.Date != '' && $scope.saleForecast.DateTarget != ''){
                    if($scope.saleForecast.Date.getTime() == $scope.saleForecast.DateTarget.getTime()){
                        $scope.duplicateUserID=true;
                    }
                }
            }
    	 	$scope.submit=function(){
                $rootScope.dateQuery = utilSvc.formatDate($scope.saleForecast.DateTarget);
                $scope.saleForecast.maintainerName = $rootScope.authUser.userName;
                $scope.saleForecast.year = $scope.saleForecast.Date.getFullYear();
                $scope.saleForecast.month = $scope.saleForecast.Date.getMonth()+1;
                $scope.saleForecast.yearTarget = $scope.saleForecast.DateTarget.getFullYear();
                $scope.saleForecast.monthTarget = $scope.saleForecast.DateTarget.getMonth()+1;
                apiSvc.copySaleForecast({saleForecast:$scope.saleForecast})
                .$promise.then(function(saleForecastList){
                    if (saleForecastList){
                        $modalInstance.close(saleForecastList);
                    } else {
                        utilSvc.addAlert("The Operation failed!", "fail", false);
                    }
                },
                function(err){
                    utilSvc.addAlert("The operation failed!", "fail", false);
                })
             }
    	 	$scope.reset=function(){
                $scope.saleForecast={};
                $scope.saleForecast.ProductTypeName='';
                $scope.saleForecast.DateTarget='';
                $scope.saleForecast.Date='';
             }
             $scope.reset();
    }])
 }());

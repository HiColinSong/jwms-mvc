/*jm - Controllers.js - Colin 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('jm.controllers')
    .controller('addEditSaleForecastCtrl', ['$scope','$rootScope', '$modalInstance','utilSvc','jmService','saleForecast','saleForecastList','productTypeList','hospitalList','salerList','constants',
    	 function($scope,$rootScope,$modalInstance,utilSvc,apiSvc,saleForecast,saleForecastList,productTypeList,hospitalList,salerList,constants){

             $scope.type=saleForecast?"Edit":"Add";
            // $scope.leiBie_list = constants.ProductTypeName;
            // $scope.salers = constants.salers;

             var productTypeArray = new Array();
             for(var i=0;i<productTypeList.length;i++){
                productTypeArray.push(productTypeList[i].FName);
             }
             $scope.productTypeList=productTypeArray;
             $scope.productTypeName = constants.productTypeName

             var hospitalArray = new Array();
             for(var i=0;i<hospitalList.length;i++){
                hospitalArray.push(hospitalList[i].FName);
             }
             $scope.hospitalList=hospitalArray;
             $scope.FHospName = constants.FHospName

             var salerArray = new Array();
             for(var i=0;i<salerList.length;i++){
                salerArray.push(salerList[i].FName);
             }
             $scope.salerList=salerArray;
             $scope.FEmpName=constants.FEmpName
            
             $scope.Month=constants.Month
             $scope.Year=constants.Year
             $scope.Aprice=constants.Aprice
             $scope.Aamout=constants.Aamout

             $scope.Fnote=constants.Fnote
             //$scope.saler = constants.saler

    	 	$scope.submit=function(){
                apiSvc.addEditSaleForecast({saleForecast:$scope.saleForecast})
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
            $scope.uniqueValidation=function(){
                $scope.duplicateUserID=false;
                saleForecastList.forEach(_saleForecast => {
                    if (_saleForecast.FHospName===$scope.saleForecast.FHospName   
                        &&_saleForecast.FEmpName===$scope.saleForecast.FEmpName
                        &&_saleForecast.Year===$scope.saleForecast.Year  
                        &&_saleForecast.Month===$scope.saleForecast.Month   
                        &&_saleForecast.productTypeName===$scope.saleForecast.productTypeName   
                        ){
                        $scope.duplicateUserID=true;
                    }
                });
            }
    	 	$scope.reset=function(){
                $scope.saleForecast={};
                angular.copy(saleForecast,$scope.saleForecast);
               // $scope.user.Domain=$scope.user.Domain||$rootScope.authUser.Domain;
                //$scope.user.isActive=($scope.user.isActive===undefined)?'1':$scope.user.isActive;
                // $scope.user.DefaultWH=$scope.user.DefaultWH||$rootScope.authUser.DefaultWH;
                // $scope.user.Domain=$scope.user.Domain||$rootScope.authUser.Domain;
                // $scope.user.UserRole=$scope.user.UserRole||"normal";
                // if ($rootScope.authUser.UserRole==="qaAdmin"){
                //     $scope.user.UserRole="qaLab";
                //     $scope.roleFilter="qa";
                // } else if ($rootScope.authUser.UserRole==="whAdmin"){
                //     $scope.user.UserRole="wh"
                //     $scope.roleFilter="wh"
                // }
             }
             $scope.reset();
    }])
 }());

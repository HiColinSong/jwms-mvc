/*jm - Controllers.js - Colin 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('jm.controllers')
    .controller('saleForecastCtrl',['$scope','$rootScope','$location','$interval','$modal','saleForecastList','productTypeList','hospitalList','utilSvc','jmService',
	function($scope,$rootScope,$location,$interval,$modal,saleForecastList,productTypeList,hospitalList,utilSvc,apiSvc){
        $scope.saleForecastList = saleForecastList;
        $scope.temp={};
        $scope.saleForecastSearch={};
        if (saleForecastList){
            $scope.saleForecastList = saleForecastList;
        } else {
            $scope.productTypeList = productTypeList;
            $scope.hospitalList = hospitalList;
              $scope.clear = function () {
                $scope.temp.dt = null;
              };
              $scope.submitForm = function() {
                //add leading 0 to the scanned order no
                $location.path("/saleForecast/"+utilSvc.formatDate($scope.temp.dt)+"/"+$scope.saleForecastSearch.ProductTypeName+"/"+$scope.saleForecastSearch.FHospName);
                $rootScope.dateQuery = utilSvc.formatDate($scope.temp.dt);
                $rootScope.productTypeNameQuery = $scope.saleForecastSearch.ProductTypeName;
                $rootScope.fHospNameQuery = $scope.saleForecastSearch.FHospName;
            }
        }
        /*
                $rootScope.$on("loginStautsChange",function(){
            if (!$rootScope.authUser) return;
            //看样子使用不到 Colin 12/23
            // if ($rootScope.authUser.UserRole==="qaAdmin"){
            //     $scope.roleFilter=function(val){
            //         return val==='qaLab'||val==='qaAdmin';
            //     }
            //     $scope.roleFilter='qa'
            // } else if ($rootScope.authUser.UserRole==="whAdmin"){
            //     $scope.roleFilter="wh"
            // } 
        })
        
        let waitForUser = $interval(function() {
            if ($rootScope.authUser) {
                $interval.cancel(waitForUser);
                if ($rootScope.authUser.UserRole==="qaAdmin"){
//                     $scope.roleFilter="qaLab";
                } else if ($rootScope.authUser.UserRole==="whAdmin"){
                    $scope.roleFilter="wh"
                } 
            }
          }, 10);
          */

        
        $scope.addOrEditSaleForecast=function(saleForecast){
            var modalInstance;
            modalInstance = $modal.open({
                templateUrl: 'partials/add-edit-sale-forecast.html',
                windowClass: "sub-detail-modal",
                controller: "addEditSaleForecastCtrl",
                backdrop: "static",
                //backdrop: false,
                resolve:{
                    saleForecast:function(){return saleForecast;},
                    saleForecastList:function(){return $scope.saleForecastList},
                    productTypeList:function(){return productTypeList},
                    hospitalList:function(){return hospitalList},
                    salerList:['$q','jmService','utilSvc',
                    function($q,apiSvc,util){
                        var deferred = $q.defer();
                        util.pageLoading("start");
                        apiSvc.getSaler().$promise.then(function(data){
                            if (data){
                                deferred.resolve(data);
                            } else {
                                deferred.resolve(undefined);
                            }
                            util.pageLoading("stop");
                        },function(err){
                            deferred.reject(err);
                            util.pageLoading("stop");
                        })
                        return deferred.promise;
                    }]
                }
            });
            modalInstance.result.then(function(saleForecastList) {
                $scope.saleForecastList = saleForecastList;
            });
        };

        $scope.copySaleForecast=function(){
            var modalInstance;
            modalInstance = $modal.open({
                templateUrl: 'partials/copy-sale-forcast.html',
                windowClass: "sub-detail-modal",
                controller: "copySaleForcastCtrl",
                backdrop: "static",
                resolve:{
                    productTypeList:function(){return productTypeList}
                }
            });
            modalInstance.result.then(function(saleForecastList) {
                $scope.saleForecastList = saleForecastList;
            });
        };

        $scope.deleteSaleForecast=function(saleForecast){                    
            apiSvc.deleteSaleForecast({saleForecast:saleForecast,date:$rootScope.dateQuery,ProductTypeName:$rootScope.productTypeNameQuery,FHospName:$rootScope.fHospNameQuery}).$promise.then(
                function(data){
                    $scope.saleForecastList = data
                },
                function(err){
                    if (err.data&&err.data.message)
                        utilSvc.addAlert(err.data.message, "fail", false);
                    else
                        utilSvc.addAlert(JSON.stringify(err), "fail", false);
                }) 
        }

    }])
 }());

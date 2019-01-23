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
            $scope.itemPerPage = 6;
            $scope.currentPage = 1;
            $scope.pageChanged=function(){
                $scope.saleForecastListByPage=[];
                var startData = $scope.itemPerPage * ($scope.currentPage-1);
                var endData = $scope.itemPerPage * $scope.currentPage-1;
                $scope.totalItems = $scope.saleForecastList.length;
                if(endData>$scope.saleForecastList.length){
                    endData = $scope.saleForecastList.length-1
                }
                var num = 0;
                if($scope.saleForecastList){
                    for(var i = startData;i<=endData;i++){
                        if($scope.saleForecastList[i]!=undefined){
                            $scope.saleForecastListByPage[num]=$scope.saleForecastList[i];
                        }
                        num++;
                    }
                }
            };
            $scope.pageChanged();
        } else {
            $scope.productTypeList = productTypeList;
            $scope.hospitalList = hospitalList;
              $scope.clear = function () {
                $scope.temp.dt = null;
              };
              $scope.submitForm = function() {
                $location.path("/saleForecast/"+utilSvc.formatDate($scope.temp.dt)+"/"+$scope.saleForecastSearch.ProductTypeName+"/"+$scope.saleForecastSearch.FHospName);
                $rootScope.dateQuery = utilSvc.formatDate($scope.temp.dt);
                $rootScope.productTypeNameQuery = $scope.saleForecastSearch.ProductTypeName;
                $rootScope.fHospNameQuery = $scope.saleForecastSearch.FHospName;
            }
        }

        
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
                $scope.adjustmentData();
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
                $scope.adjustmentData();
            });
        };

        $scope.deleteSaleForecast=function(saleForecast){       
            var dateHere;
            if($rootScope.dateQuery==undefined){
                dateHere = saleForecast.Year+"-"+saleForecast.Month;
            } else {
                dateHere = $rootScope.dateQuery
            }
            apiSvc.deleteSaleForecast({saleForecast:saleForecast,date:dateHere,ProductTypeName:$rootScope.productTypeNameQuery,FHospName:$rootScope.fHospNameQuery}).$promise.then(
                function(data){
                    $scope.saleForecastList = data;
                    $scope.adjustmentData();
                },
                function(err){
                    if (err.data&&err.data.message)
                        utilSvc.addAlert(err.data.message, "fail", false);
                    else
                        utilSvc.addAlert(JSON.stringify(err), "fail", false);
                }) 
        };

        $scope.adjustmentData=function(){
            $scope.saleForecastListByPage=[];
            var startData = $scope.itemPerPage * ($scope.currentPage-1);
            var endData = $scope.itemPerPage * $scope.currentPage-1;
            $scope.totalItems = $scope.saleForecastList.length;
            if(endData>$scope.saleForecastList.length){
                endData = $scope.saleForecastList.length-1
            }
            var num = 0;
            if($scope.saleForecastList){
                for(var i = startData;i<=endData;i++){
                    if($scope.saleForecastList[i]!=undefined){
                        $scope.saleForecastListByPage[num]=$scope.saleForecastList[i];
                    }
                    num++;
                }
            }
        };

    }])
 }());

/*jm - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('jm.controllers')
    .controller('budgetAndIncomeReportCtrl',['$scope','$routeParams','$location', 'report', 'productTypeList','hospitalList','utilSvc',
        function($scope,$routeParams,$location,report,productTypeList,hospitalList,utilSvc){
          $scope.temp={};
          $scope.saleForecastSearch={};
          if (report){
            $scope.report=report;

            } else {
             
              $scope.productTypeList = productTypeList;
              $scope.hospitalList = hospitalList;
              $scope.clear = function () {
                $scope.temp.dt = null;
              };
              $scope.submitForm = function() {
                //add leading 0 to the scanned order no
                $location.path("/budgetAndIncomeReport/"+utilSvc.formatDate($scope.temp.dt)+"/"+$scope.saleForecastSearch.ProductTypeName+"/"+$scope.saleForecastSearch.FHospName);

                // $rootScope.dateQuery = utilSvc.formatDate($scope.temp.dt);
                // $rootScope.productTypeNameQuery = $scope.saleForecastSearch.ProductTypeName;
                // $rootScope.fHospNameQuery = $scope.saleForecastSearch.FHospName;
            }
            }
    }])
 }());

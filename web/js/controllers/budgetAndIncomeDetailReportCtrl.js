/*jm - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('jm.controllers')
    .controller('budgetAndIncomeDetailReportCtrl',['$scope','$routeParams','$location', 'report','utilSvc',
        function($scope,$routeParams,$location,report,utilSvc){
          $scope.temp={};
         // debugger;
          if (report){
            $scope.report=report;

            } else {
              $scope.clear = function () {
                $scope.temp.dt = null;
              };
              $scope.submitForm = function() {
                //add leading 0 to the scanned order no
                $location.path("/budgetAndIncomeDetailReport/"+utilSvc.formatDate($scope.temp.dt));
            }
            }
    }])
 }());

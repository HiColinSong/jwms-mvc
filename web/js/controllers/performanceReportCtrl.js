/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('performanceReportCtrl',['$scope', 'report',
        function($scope,report){
            $scope.report=report;
            $scope.temp={};
            
            
              $scope.clear = function () {
                $scope.temp.dt = null;
              };
    }])
 }());

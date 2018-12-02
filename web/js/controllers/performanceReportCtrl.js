/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('performanceReportCtrl',['$scope', 'report',
        function($scope,report){
            $scope.report=report

    }])
 }());

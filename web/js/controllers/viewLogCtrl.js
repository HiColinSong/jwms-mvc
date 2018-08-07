/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('viewLogCtrl',['$scope','$location','$modal','logs','utilSvc','bxService',
	function($scope,$location,$modal,logs,utilSvc,apiSvc){

        $scope.logs = logs;
        $scope.viewDetail=function(log){
            $scope.log=log;
            var modalInstance;
            modalInstance = $modal.open({
                templateUrl: 'partials/view-log-detail.html',
                windowClass: "sub-detail-modal",
                // backdrop: "static",
                scope:$scope
            });
        };

    }])
 }());

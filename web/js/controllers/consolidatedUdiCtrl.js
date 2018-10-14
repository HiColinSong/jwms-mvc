/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('consolidatedUdiCtrl', ['$scope','$rootScope','$location','$routeParams','$timeout',
                'utilSvc','bxService','modalConfirmSubmit',
            function($scope,$rootScope,$location,$routeParams,$timeout,
                     utilSvc,apiSvc,confirmSubmit){
                    $scope.temp={};

       
            $scope.submitForm = function() {
                if (!$scope.piDoc.docNo){
                    $rootScope.setFocus("docNo");
                    return;
                }
                if (!$scope.piDoc.fiscalYear){
                    $rootScope.setFocus("fiscalYear");
                    return;
                }
                //add leading 0 to the scanned order no
                $location.path("/store-ops/counting-im/"+utilSvc.formalizeOrderNo($scope.piDoc.docNo)+"/"+$scope.piDoc.fiscalYear);
        }

    }])
 }());

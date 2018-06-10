/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('subconOrdersCtrl', ['$scope','$location','$routeParams','$filter','utilSvc',
                'bxService','constants','modalConfirmSubmit','scanItemSvc','soundSvc',
            function($scope,$location,$routeParams,$filter,utilSvc,
                     apiSvc,constants,confirmSubmit,itemSvc,soundSvc){
            $scope.order = {};
            apiSvc.getSubconOrderList()
                .$promise.then(function(data){
                    $scope.subconOrders = data;
                },function(err){
                    console.log(err);
                })

                $scope.getWorkOrders = function() {
                    $location.path("/receiving/spoReceipts/"+$scope.order.orderNo);
                }
    }])
 }())

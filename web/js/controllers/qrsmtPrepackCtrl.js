/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('qrsmtPrepackCtrl', ['$scope', '$controller', 'order', function ($scope, $controller,order){
        $controller('packingCtrl', {$scope: $scope,order:order})
    }])
 }())

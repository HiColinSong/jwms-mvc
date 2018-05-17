/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('homeCtrl',['$scope','$http','$location', function($scope,$http,$location){
    	// $scope.barcode1="01088888930163991714111310W131004584";
    	// $scope.ascii29="abc";
    	$scope.ascii29=String.fromCharCode(29);
    	$scope.EANCode='0108888893016399';
    	$scope.expiry='17141113';
    	$scope.batchNo='10W131004584';
		$scope.serialNo='211803W189';
		$scope.url = $location.absUrl();
		    $http.get('/db-info.json').then(function(res){
		        if (res){
					$scope.dbInfo=res.data;
		        } 
		    },function(err){
		        console.error(err);
		    })
    	// $scope.barcode2="211803W189";
    	// $scope.fullCode=$scope.barcode1+$scope.ascii29+$scope.barcode2;
    	// $scope.fullCodeLength=$scope.fullCode.length;
    	// $scope.fullCode1=$scope.barcode1+$scope.barcode2;
    	// $scope.fullCode1Length=$scope.fullCode1.length;
    }])
 }())

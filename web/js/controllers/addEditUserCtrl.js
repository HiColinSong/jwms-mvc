/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('addEditUserCtrl', ['$scope','$rootScope', '$modalInstance','utilSvc','bxService','user',
    	 function($scope,$rootScope,$modalInstance,utilSvc,apiSvc,user){

             $scope.type=user?"Edit":"Add";
    	 	$scope.submit=function(){

                apiSvc.addEditUser({user:$scope.user})
                .$promise.then(function(userList){
                    if (userList){
                        $modalInstance.close(userList);
                    } else {
                        utilSvc.addAlert("The Operation failed!", "fail", false);
                    }
                },
                function(err){
                    utilSvc.addAlert("The operation failed!", "fail", false);
                })
    	 	}
    	 	$scope.reset=function(){
                $scope.user={};
                angular.copy(user,$scope.user);
                $scope.user.isActive=($scope.user.isActive===undefined)?'0':$scope.user.isActive;
                $scope.user.DefaultWH=$scope.user.DefaultWH||$rootScope.authUser.DefaultWH;
                $scope.user.Domain=$scope.user.Domain||$rootScope.authUser.Domain;
                $scope.user.UserRole=$scope.user.UserRole||"normal";
             }
             $scope.reset();
    }])
 }())

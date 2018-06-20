/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('adminCtrl',['$scope','$rootScope','$location','$modal','userList','utilSvc','bxService',
	function($scope,$rootScope,$location,$modal,userList,utilSvc,apiSvc){

        $scope.userList = userList;
        $rootScope.$on("loginStautsChange",function(){
            if (!$rootScope.authUser) return;
            if ($rootScope.authUser.UserRole==="qaAdmin"){
                $scope.roleFilter="qa";
            } else if ($rootScope.authUser.UserRole==="whAdmin"){
                $scope.roleFilter="wh"
            }
        })
        $scope.addOrEditUser=function(user){
            var modalInstance;
            modalInstance = $modal.open({
                templateUrl: 'partials/add-edit-user.html',
                windowClass: "sub-detail-modal",
                controller: "addEditUserCtrl",
                backdrop: "static",
                resolve:{
                    user:function(){return user;},
                    userList:function(){return $scope.userList}
                }
            });
            modalInstance.result.then(function(userList) {
                $scope.userList = userList;
            });
        };
        $scope.deleteUser=function(user){
            apiSvc.deleteUser({user:user}).$promise.then(
                function(data){
                    $scope.userList = data
                },
                function(err){
                    if (err.data&&err.data.message)
                        utilSvc.addAlert(err.data.message, "fail", false);
                    else
                        utilSvc.addAlert(JSON.stringify(err), "fail", false);
                }) 
        }

    }])
 }())

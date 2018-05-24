/*bx - controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    angular.module('bx.controllers')
    .controller("loginCtrl",[ "$scope",'$route','$location', "bxService",
					function($scope, $route,$location, apiSvc) {
						$scope.login = {
							username : "",
							password : "",
							domain: "BITSG"
						};
						$scope.submitForm = function() {
							// form:"+$scope.login.username+":"+$scope.login.password);
							apiSvc.login($scope.login).$promise.then(function(data) {
                                if (data.loginUser){
								    console.log("login callback:" + data.loginUser.name);
                                    if ($location.path()!=='/home')
    								    $route.reload();
                                    else 
                                        $location.path("/")
                                } else if (data&&data.status===401){
                                    $scope.login.errMsg ='LOGIN_ERROR_MSG';
                                }
							}, function(err) {
								console.error("login fail:" + (err.data.message||err.status));
								// console.error("login error
								// message:"+err.data.errorMessage);
								$scope.login.errMsg = err.data.message||err.statusText||"Username or password incorrect!";

							})
						};
					} 
		]);
}());

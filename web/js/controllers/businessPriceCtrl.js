/*jm - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('jm.controllers')
    .controller('businessPriceCtrl',['$scope','$rootScope','$interval','$modal','businessPriceList','utilSvc','jmService',
	function($scope,$rootScope,$interval,$modal,businessPriceList,utilSvc,apiSvc){

        $scope.businessPriceList = businessPriceList;
        /* $rootScope.$on("loginStautsChange",function(){
            if (!$rootScope.authUser) return;
            if ($rootScope.authUser.UserRole==="qaAdmin"){
                $scope.roleFilter=function(val){
                    return val==='qaLab'||val==='qaAdmin';
                }
                $scope.roleFilter='qa'
            } else if ($rootScope.authUser.UserRole==="whAdmin"){
                $scope.roleFilter="wh"
            } 
        }) */
        /* let waitForUser = $interval(function() {
            if ($rootScope.authUser) {
                $interval.cancel(waitForUser);
                if ($rootScope.authUser.UserRole==="qaAdmin"){
//                     $scope.roleFilter="qaLab";
                } else if ($rootScope.authUser.UserRole==="whAdmin"){
                    $scope.roleFilter="wh"
                } 
            }
          }, 10); */

        $scope.addOrEditBusinessPrice=function(businessPrice){
            var modalInstance;
            modalInstance = $modal.open({
                templateUrl: 'partials/add-edit-business-price.html',
                windowClass: "sub-detail-modal",
                controller: "addEditBusinessPriceCtrl",
                backdrop: "static",
                resolve:{
                    businessPrice:function(){return businessPrice;},
                    businessPriceList:function(){return $scope.businessPriceList},
                    productTypeList:['$q','jmService','utilSvc',
                        function($q,apiSvc,util){
                            var deferred = $q.defer();
                            //util.pageLoading("start");
                            apiSvc.getProductType().$promise.then(function(data){
                                if (data){
                                    deferred.resolve(data);
                                } else {
                                    deferred.resolve(undefined);
                                }
                                //util.pageLoading("stop");
                            },function(err){
                                deferred.reject(err);
                                //util.pageLoading("stop");
                            })
                            return deferred.promise;
                        }],
                    agentList:['$q','jmService','utilSvc',
                    function($q,apiSvc,util){
                        var deferred = $q.defer();
                        //util.pageLoading("start");
                        apiSvc.getAgent().$promise.then(function(data){
                            if (data){
                                deferred.resolve(data);
                            } else {
                                deferred.resolve(undefined);
                            }
                            //util.pageLoading("stop");
                        },function(err){
                            deferred.reject(err);
                            //util.pageLoading("stop");
                        })
                        return deferred.promise;
                    }],
                    hospitalList:['$q','jmService','utilSvc',
                    function($q,apiSvc,util){
                        var deferred = $q.defer();
                        util.pageLoading("start");
                        apiSvc.getHospital().$promise.then(function(data){
                            if (data){
                                deferred.resolve(data);
                            } else {
                                deferred.resolve(undefined);
                            }
                            util.pageLoading("stop");
                        },function(err){
                            deferred.reject(err);
                            util.pageLoading("stop");
                        })
                        return deferred.promise;
                    }]
                }
            });
            modalInstance.result.then(function(businessPriceList) {
                $scope.businessPriceList = businessPriceList;
            });
        };
        $scope.deleteBusinessPrice=function(businessPrice){
            apiSvc.deleteBusinessPrice({businessPrice:businessPrice}).$promise.then(
                function(data){
                    $scope.businessPriceList = data
                },
                function(err){
                    if (err.data&&err.data.message)
                        utilSvc.addAlert(err.data.message, "fail", false);
                    else
                        utilSvc.addAlert(JSON.stringify(err), "fail", false);
                }) 
        }

    }])
 }());

/*jm - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('jm.controllers')
    .controller('promotionDiscountCtrl',['$scope','$rootScope','$interval','$modal','promotionDiscountList','utilSvc','jmService',
	function($scope,$rootScope,$interval,$modal,promotionDiscountList,utilSvc,apiSvc){

        $scope.promotionDiscountList = promotionDiscountList;
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

        $scope.addOrEditPromotionDiscount=function(promotionDiscount){
            var modalInstance;
            modalInstance = $modal.open({
                templateUrl: 'partials/add-edit-promotion-discount.html',
                windowClass: "sub-detail-modal",
                controller: "addEditPromotionDiscountCtrl",
                backdrop: "static",
                resolve:{
                    promotionDiscount:function(){return promotionDiscount;},
                    promotionDiscountList:function(){return $scope.promotionDiscountList},
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
            modalInstance.result.then(function(promotionDiscountList) {
                $scope.promotionDiscountList = promotionDiscountList;
            });
        };


        $scope.deletePromotionDiscount=function(promotionDiscount){
            apiSvc.deletePromotionDiscount({promotionDiscount:promotionDiscount}).$promise.then(
                function(data){
                    $scope.promotionDiscountList = data
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

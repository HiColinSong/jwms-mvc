/*jm - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('jm.controllers')
    .controller('promotionDiscountCtrl',['$scope','$rootScope','$location','$interval','$modal','promotionDiscountList','productTypeList','hospitalList','utilSvc','jmService',
	function($scope,$rootScope,$location,$interval,$modal,promotionDiscountList,productTypeList,hospitalList,utilSvc,apiSvc){

        $scope.temp={};
        $scope.promotionDiscountSearch={};
        if (promotionDiscountList){
            $scope.promotionDiscountList = promotionDiscountList;
        } else {
            $scope.productTypeList = productTypeList;
            $scope.hospitalList = hospitalList;
              $scope.clear = function () {
                $scope.temp.dt = null;
              };
              $scope.submitForm = function() {
                //add leading 0 to the scanned order no
                $location.path("/promotionDiscountMaintenance/"+utilSvc.formatDate($scope.temp.dt)+"/"+$scope.promotionDiscountSearch.ProductTypeName+"/"+$scope.promotionDiscountSearch.FHospName);
            }
        }
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
                    productTypeList:function(){return productTypeList},
                    hospitalList:function(){return hospitalList}
                }
            });
            modalInstance.result.then(function(promotionDiscountList) {
                $scope.promotionDiscountList = promotionDiscountList;
            });
        };


        $scope.deletePromotionDiscount=function(promotionDiscount){
            apiSvc.deletePromotionDiscount({promotionDiscount:promotionDiscount,date:utilSvc.formatDate($scope.temp.dt),ProductTypeName:$scope.promotionDiscountSearch.ProductTypeName,FHospName:$scope.promotionDiscountSearch.FHospName}).$promise.then(
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

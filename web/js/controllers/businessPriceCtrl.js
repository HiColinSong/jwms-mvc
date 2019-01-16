/*jm - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('jm.controllers')
    .controller('businessPriceCtrl',['$scope','$rootScope','$location','$interval','$modal','businessPriceList','agentList','hospitalList','productTypeList','utilSvc','jmService',
	function($scope,$rootScope,$location,$interval,$modal,businessPriceList,agentList,hospitalList,productTypeList,utilSvc,apiSvc){
        $scope.temp={};
        $scope.businessPriceSearch={};
        if (businessPriceList){
            $scope.businessPriceList = businessPriceList;
        } else {
            $scope.productTypeList = productTypeList;
            $scope.hospitalList = hospitalList;
              $scope.clear = function () {
                $scope.temp.dt = null;
              };
              $scope.submitForm = function() {
                //add leading 0 to the scanned order no
                $location.path("/businessPriceMaintenance/"+utilSvc.formatDate($scope.temp.dt)+"/"+$scope.businessPriceSearch.ProductTypeName+"/"+$scope.businessPriceSearch.FHospName);
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
                    hospitalList:function(){return hospitalList},
                    agentList:function(){return agentList},
                    productTypeList:function(){return productTypeList}
                }
            });
            modalInstance.result.then(function(businessPriceList) {
                $scope.businessPriceList = businessPriceList;
            });
        };
        $scope.deleteBusinessPrice=function(businessPrice){
            apiSvc.deleteBusinessPrice({businessPrice:businessPrice,date:utilSvc.formatDate($scope.temp.dt),ProductTypeName:$scope.businessPriceSearch.ProductTypeName,FHospName:$scope.businessPriceSearch.FHospName}).$promise.then(
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

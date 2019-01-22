/*jm - Controllers.js - zhiqiangsong 2019*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('jm.controllers')
    .controller('businessPriceCtrl',['$scope','$rootScope','$location','$modal','businessPriceList','agentList','hospitalList','productTypeList','utilSvc','jmService',
	function($scope,$rootScope,$location,$modal,businessPriceList,agentList,hospitalList,productTypeList,utilSvc,apiSvc){
        $scope.temp={};
        $scope.businessPriceSearch={};
        if (businessPriceList){
            $scope.businessPriceList = businessPriceList;
            $scope.totalItems = businessPriceList.length;
            $scope.itemPerPage = 6;
            $scope.currentPage = 1;
            $scope.pageChanged=function(){
                $scope.businessPriceListByPage=[];
                var startData = $scope.itemPerPage * ($scope.currentPage-1);
                var endData = $scope.itemPerPage * $scope.currentPage-1;
                if(endData>$scope.totalItems){
                    endData = $scope.totalItems-1
                }
                var num = 0;
                if($scope.businessPriceList){
                    for(var i = startData;i<=endData;i++){
                        if($scope.businessPriceList[i]!=undefined){
                            $scope.businessPriceListByPage[num]=$scope.businessPriceList[i];
                        }
                        num++;
                    }
                }
            };
            $scope.pageChanged();
        } else {
            $scope.productTypeList = productTypeList;
            $scope.hospitalList = hospitalList;
              $scope.clear = function () {
                $scope.temp.dt = null;
              };
              $scope.submitForm = function() {
                $location.path("/businessPriceMaintenance/"+utilSvc.formatDate($scope.temp.dt)+"/"+$scope.businessPriceSearch.ProductTypeName+"/"+$scope.businessPriceSearch.FHospName);
                $rootScope.dateQuery = utilSvc.formatDate($scope.temp.dt);
                $rootScope.productTypeNameQuery = $scope.businessPriceSearch.ProductTypeName;
                $rootScope.fHospNameQuery = $scope.businessPriceSearch.FHospName;
            }
        }

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
        $scope.copyBusinessPrice=function(){
            var modalInstance;
            modalInstance = $modal.open({
                templateUrl: 'partials/copy-business-price.html',
                windowClass: "sub-detail-modal",
                controller: "copyBusinessPriceCtrl",
                backdrop: "static",
                resolve:{
                    productTypeList:function(){return productTypeList}
                }
            });
            modalInstance.result.then(function(businessPriceList) {
                $scope.businessPriceList = businessPriceList;
            });
        };
        $scope.deleteBusinessPrice=function(businessPrice){
            apiSvc.deleteBusinessPrice({businessPrice:businessPrice,date:$rootScope.dateQuery,ProductTypeName:$rootScope.productTypeNameQuery,FHospName:$rootScope.fHospNameQuery}).$promise.then(
                function(data){
                    $scope.businessPriceList = data
                },
                function(err){
                    if (err.data&&err.data.message)
                        utilSvc.addAlert(err.data.message, "fail", false);
                    else
                        utilSvc.addAlert(JSON.stringify(err), "fail", false);
                }) 
        };

    }])
 }());

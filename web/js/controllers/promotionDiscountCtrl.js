/*jm - Controllers.js - zhiqiangsong 2019*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('jm.controllers')
    .controller('promotionDiscountCtrl',['$scope','$rootScope','$location','$modal','promotionDiscountList','productTypeList','hospitalList','utilSvc','jmService','constants',
	function($scope,$rootScope,$location,$modal,promotionDiscountList,productTypeList,hospitalList,utilSvc,apiSvc,constants){
        $scope.temp={};
        $scope.promotionDiscountSearch={};        
        if (promotionDiscountList){
            $scope.promotionDiscountList = promotionDiscountList;
            $scope.itemPerPage = constants.pageMessage.itemPerPage;
            $scope.currentPage = constants.pageMessage.currentPage;
            $scope.maxSize = constants.pageMessage.maxSize;
            $scope.pageChanged=function(){
                $scope.promotionDiscountListByPage=[];
                var startData = $scope.itemPerPage * ($scope.currentPage-1);
                var endData = $scope.itemPerPage * $scope.currentPage-1;
                $scope.totalItems = $scope.promotionDiscountList.length;
                if(endData>$scope.promotionDiscountList.length){
                    endData = $scope.promotionDiscountList.length-1
                }
                var num = 0;
                if($scope.promotionDiscountList){
                    for(var i = startData;i<=endData;i++){
                        if($scope.promotionDiscountList[i]!=undefined){
                            $scope.promotionDiscountListByPage[num]=$scope.promotionDiscountList[i];
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
                $location.path("/promotionDiscountMaintenance/"+utilSvc.formatDate($scope.temp.dt)+"/"+$scope.promotionDiscountSearch.ProductTypeName+"/"+$scope.promotionDiscountSearch.FHospName);
                $rootScope.dateQuery = utilSvc.formatDate($scope.temp.dt);
                $rootScope.productTypeNameQuery = $scope.promotionDiscountSearch.ProductTypeName;
                $rootScope.fHospNameQuery = $scope.promotionDiscountSearch.FHospName;
            }
        }

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

                $scope.adjustmentData();
            });
        };

        $scope.copyPromotionDiscount=function(){
            var modalInstance;
            modalInstance = $modal.open({
                templateUrl: 'partials/copy-promotion-discount.html',
                windowClass: "sub-detail-modal",
                controller: "copyPromotionDiscountCtrl",
                backdrop: "static",
                resolve:{
                    productTypeList:function(){return productTypeList}
                }
            });
            modalInstance.result.then(function(promotionDiscountList) {
                $scope.promotionDiscountList = promotionDiscountList;
                $scope.adjustmentData();
            });
        };

        $scope.deletePromotionDiscount=function(promotionDiscount){
            var dateHere;
            if($rootScope.dateQuery==undefined){
                dateHere = promotionDiscount.Year+"-"+promotionDiscount.Month;
            } else {
                dateHere = $rootScope.dateQuery
            }
            apiSvc.deletePromotionDiscount({promotionDiscount:promotionDiscount,date:dateHere,ProductTypeName:$rootScope.productTypeNameQuery,FHospName:$rootScope.fHospNameQuery}).$promise.then(
                function(data){
                    $scope.promotionDiscountList = data
                    $scope.adjustmentData();
                },
                function(err){
                    if (err.data&&err.data.message)
                        utilSvc.addAlert(err.data.message, "fail", false);
                    else
                        utilSvc.addAlert(JSON.stringify(err), "fail", false);
                }) 
        };

        $scope.adjustmentData=function(){
            $scope.promotionDiscountListByPage=[];
            var startData = $scope.itemPerPage * ($scope.currentPage-1);
            var endData = $scope.itemPerPage * $scope.currentPage-1;
            $scope.totalItems = $scope.promotionDiscountList.length;
            if(endData>$scope.promotionDiscountList.length){
                endData = $scope.promotionDiscountList.length-1
            }
            var num = 0;
            if($scope.promotionDiscountList){
                for(var i = startData;i<=endData;i++){
                    if($scope.promotionDiscountList[i]!=undefined){
                        $scope.promotionDiscountListByPage[num]=$scope.promotionDiscountList[i];
                    }
                    num++;
                }
            }
        }
    }])
 }());

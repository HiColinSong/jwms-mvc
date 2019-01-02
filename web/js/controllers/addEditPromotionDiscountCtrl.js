/*jm - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('jm.controllers')
    .controller('addEditPromotionDiscountCtrl', ['$scope','$rootScope', '$modalInstance','utilSvc','jmService','promotionDiscount','promotionDiscountList','productTypeList','hospitalList','constants',
    	 function($scope,$rootScope,$modalInstance,utilSvc,apiSvc,promotionDiscount,promotionDiscountList,productTypeList,hospitalList,constants){
             $scope.type=promotionDiscount?"Edit":"Add";
             if(promotionDiscount){
                 $scope.promotionDiscount = promotionDiscount;
                 $scope.promotionDiscount.Date = promotionDiscount.Year + '年' + promotionDiscount.Month + '月';
             }
             //$scope.userRoles = constants.userRoles;
             var productTypeArray = new Array();
             for(var i=0;i<productTypeList.length;i++){
                productTypeArray.push(productTypeList[i].FName);
             }
             $scope.productTypeList=productTypeArray;


             var hospitalArray = new Array();
             for(var i=0;i<hospitalList.length;i++){
                hospitalArray.push(hospitalList[i].FName);
             }
             $scope.hospitalList=hospitalArray;

    	 	$scope.submit=function(){
                apiSvc.addEditPromotionDiscount({promotionDiscount:$scope.promotionDiscount})
                .$promise.then(function(promotionDiscountList){
                    if (promotionDiscountList){
                        $modalInstance.close(promotionDiscountList);
                    } else {
                        utilSvc.addAlert("The Operation failed!", "fail", false);
                    }
                },
                function(err){
                    utilSvc.addAlert("The operation failed!", "fail", false);
                })
             }
    	 	$scope.reset=function(){
                $scope.promotionDiscount={};
                angular.copy(promotionDiscount,$scope.promotionDiscount);
                $scope.promotionDiscount.FHospName='';
                $scope.promotionDiscount.ProductTypeName='';
                $scope.promotionDiscount.Date='';
                $scope.promotionDiscount.Ssample='';
                $scope.promotionDiscount.ODActivity='';
                $scope.promotionDiscount.Fnote='';
             }
             //$scope.reset();  
    }])
 }());

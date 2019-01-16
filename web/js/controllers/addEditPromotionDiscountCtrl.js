/*jm - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('jm.controllers')
    .controller('addEditPromotionDiscountCtrl', ['$scope','$rootScope', '$modalInstance','utilSvc','jmService','promotionDiscount','promotionDiscountList','productTypeList','hospitalList','constants',
    	 function($scope,$rootScope,$modalInstance,utilSvc,apiSvc,promotionDiscount,promotionDiscountList,productTypeList,hospitalList,constants){ 
             
            $scope.type=promotionDiscount?"Edit":"Add";
            $scope.productTypeList=productTypeList;
            $scope.hospitalList=hospitalList;

            $scope.uniqueValidation=function(){
                $scope.duplicateUserID=false;
                if ($scope.promotionDiscount.Date != ''){
                    var date;
                    if($scope.promotionDiscount.Date.indexOf("年")>-1){
                        let date_str = $scope.promotionDiscount.Date.replace(/年/g,"/");
                        date_str = date_str.replace(/月/g,"");
                        date = new Date(date_str);
                    } else {
                        date = new Date($scope.promotionDiscount.Date);
                    }
                    var year = date.getFullYear();
                    var month = date.getMonth()+1;
                    promotionDiscountList.forEach(_promotionDiscount => {
                        if (_promotionDiscount.FHospName===$scope.promotionDiscount.FHospName && _promotionDiscount.ProductTypeName===$scope.promotionDiscount.ProductTypeName &&  _promotionDiscount.Year ===year && _promotionDiscount.Month ===month){
                            $scope.duplicateUserID=true;
                        }
                    });
                }
            }
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
                $scope.duplicateUserID=false;
                if(promotionDiscount){
                    $scope.promotionDiscount.FHospName=promotionDiscount.FHospName;
                    $scope.promotionDiscount.ProductTypeName=promotionDiscount.ProductTypeName;
                    $scope.promotionDiscount.Date=promotionDiscount.Date;
                    $scope.promotionDiscount.Ssample=promotionDiscount.Ssample;
                    $scope.promotionDiscount.ODActivity=promotionDiscount.ODActivity;
                    $scope.promotionDiscount.Fnote=promotionDiscount.Fnote;
                    $scope.promotionDiscount.Date = promotionDiscount.Year + '年' + promotionDiscount.Month + '月';
                } else {
                    $scope.promotionDiscount.FHospName='';
                    $scope.promotionDiscount.ProductTypeName='';
                    $scope.promotionDiscount.Date='';
                    $scope.promotionDiscount.Ssample='';
                    $scope.promotionDiscount.ODActivity='';
                    $scope.promotionDiscount.Fnote='';
                }
             }
             $scope.reset();  
    }])
 }());

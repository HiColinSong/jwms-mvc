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
                // if ($scope.promotionDiscount.Date != ''){
                //     var date;
                //     if(!($scope.promotionDiscount.Date instanceof Date)){
                //         if($scope.promotionDiscount.Date.indexOf("年")>-1){
                //             let date_str = $scope.promotionDiscount.Date.replace(/年/g,"/");
                //             date_str = date_str.replace(/月/g,"");
                //             date = new Date(date_str);
                //         } else {
                //             date = new Date($scope.promotionDiscount.Date);
                //         }
                //     }else {
                //         date = $scope.promotionDiscount.Date;
                //     }
                //     var year = date.getFullYear();
                //     var month = date.getMonth()+1;
                //     promotionDiscountList.forEach(_promotionDiscount => {
                //         if (_promotionDiscount.FID!=$scope.promotionDiscount.FID &&_promotionDiscount.FHospName===$scope.promotionDiscount.FHospName && _promotionDiscount.ProductTypeName===$scope.promotionDiscount.ProductTypeName &&  _promotionDiscount.Year ===year && _promotionDiscount.Month ===month){
                //             $scope.duplicateUserID=true;
                //         }
                //     });
                // }
            }
    	 	$scope.submit=function(){
                $scope.promotionDiscount.maintainerName = $rootScope.authUser.userName;
                if($scope.promotionDiscount.FDateFrom!=undefined){
                    $scope.promotionDiscount.FDateFrom=utilSvc.formatDate($scope.promotionDiscount.FDateFrom);
                } 
                if($scope.promotionDiscount.FDateTo!=undefined){
                    $scope.promotionDiscount.FDateTo=utilSvc.formatDate($scope.promotionDiscount.FDateTo);
                } 
                if($scope.promotionDiscount.FDateTo<$scope.promotionDiscount.FDateFrom){
                    //$scope.addAlert("截至日期不能小于开始日期!", "警告", false);
                    alert("截至日期不能小于开始日期!");                   
                    return;
                }   
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
                    $scope.promotionDiscount.FDateFrom=promotionDiscount.FDateFrom;
                    $scope.promotionDiscount.FDateTo=promotionDiscount.FDateTo;
                    $scope.promotionDiscount.Ssample=promotionDiscount.Ssample;
                    $scope.promotionDiscount.ODActivity=promotionDiscount.ODActivity;
                    $scope.promotionDiscount.Fnote=promotionDiscount.Fnote;
                    $scope.promotionDiscount.Date = promotionDiscount.Year + '年' + promotionDiscount.Month + '月';
                } else {
                    $scope.promotionDiscount.FHospName='';
                    $scope.promotionDiscount.ProductTypeName='';
                    $scope.promotionDiscount.FDateFrom='';
                    $scope.promotionDiscount.FDateTo='';
                    $scope.promotionDiscount.Ssample='';
                    $scope.promotionDiscount.ODActivity='';
                    $scope.promotionDiscount.Fnote='';
                }
             }
             $scope.reset();  
    }])
 }());

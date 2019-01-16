/*jm - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('jm.controllers')
    .controller('addEditBusinessPriceCtrl', ['$scope','$rootScope', '$modalInstance','utilSvc','jmService','businessPrice','businessPriceList','productTypeList','agentList','hospitalList','constants',
    	 function($scope,$rootScope,$modalInstance,utilSvc,apiSvc,businessPrice,businessPriceList,productTypeList,agentList,hospitalList,constants){
             $scope.type=businessPrice?"Edit":"Add";
             $scope.productTypeList=productTypeList;
             $scope.agentList=agentList;
             $scope.hospitalList=hospitalList;

             $scope.uniqueValidation=function(){
                $scope.duplicateUserID=false;
                if ($scope.businessPrice.Date != ''){
                    var date;
                    if(!($scope.businessPrice.Date instanceof Date)){
                        if($scope.businessPrice.Date.indexOf("年")>-1){
                            let date_str = $scope.businessPrice.Date.replace(/年/g,"/");
                            date_str = date_str.replace(/月/g,"");
                            date = new Date(date_str);
                        } else {
                            date = new Date($scope.businessPrice.Date);
                        }
                    } else {
                        date = $scope.businessPrice.Date;
                    }
                    var year = date.getFullYear();
                    var month = date.getMonth()+1;
                    businessPriceList.forEach(_businessPrice => {
                        if (_businessPrice.FID!=$scope.businessPrice.FID && _businessPrice.FHospName===$scope.businessPrice.FHospName && _businessPrice.ProductTypeName===$scope.businessPrice.ProductTypeName &&  _businessPrice.Year ===year && _businessPrice.Month ===month){
                            $scope.duplicateUserID=true;
                        }
                    });
                }
            }
    	 	$scope.submit=function(){
                $scope.businessPrice.maintainerName = $rootScope.authUser.userName;
                apiSvc.addEditBusinessPrice({businessPrice:$scope.businessPrice})
                .$promise.then(function(businessPriceList){
                    if (businessPriceList){
                        $modalInstance.close(businessPriceList);
                    } else {
                        utilSvc.addAlert("The Operation failed!", "fail", false);
                    }
                },
                function(err){
                    utilSvc.addAlert("The operation failed!", "fail", false);
                })
             }
    	 	$scope.reset=function(){
                $scope.businessPrice={};
                angular.copy(businessPrice,$scope.businessPrice);

                if(businessPrice){
                    $scope.businessPrice.FHospName=businessPrice.FHospName;
                    $scope.businessPrice.DistributorName=businessPrice.DistributorName;
                    $scope.businessPrice.ProductTypeName=businessPrice.ProductTypeName;
                    $scope.businessPrice.Date=businessPrice.Date;
                    $scope.businessPrice.CSPrice=businessPrice.CSPrice;
                    $scope.businessPrice.BARebate=businessPrice.BARebate;
                    $scope.businessPrice.TTBoot=businessPrice.TTBoot;
                    $scope.businessPrice.Spromotion=businessPrice.Spromotion;
                    $scope.businessPrice.BTBGift=businessPrice.BTBGift;
                    $scope.businessPrice.BNHDAward=businessPrice.BNHDAward;
                    $scope.businessPrice.Fnote=businessPrice.Fnote;
                    $scope.businessPrice.Date = businessPrice.Year + '年' + businessPrice.Month + '月';
                } else {
                    $scope.businessPrice.FHospName='';
                    $scope.businessPrice.DistributorName='';
                    $scope.businessPrice.ProductTypeName='';
                    $scope.businessPrice.Date='';
                    $scope.businessPrice.CSPrice='';
                    $scope.businessPrice.BARebate='';
                    $scope.businessPrice.TTBoot='';
                    $scope.businessPrice.Spromotion='';
                    $scope.businessPrice.BTBGift='';
                    $scope.businessPrice.BNHDAward='';
                    $scope.businessPrice.Fnote='';
                }
             }
             $scope.reset();
    }])
 }());

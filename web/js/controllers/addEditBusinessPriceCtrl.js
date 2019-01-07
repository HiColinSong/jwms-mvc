/*jm - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('jm.controllers')
    .controller('addEditBusinessPriceCtrl', ['$scope','$rootScope', '$modalInstance','utilSvc','jmService','businessPrice','businessPriceList','productTypeList','agentList','hospitalList','constants',
    	 function($scope,$rootScope,$modalInstance,utilSvc,apiSvc,businessPrice,businessPriceList,productTypeList,agentList,hospitalList,constants){
             $scope.type=businessPrice?"Edit":"Add";
             var productTypeArray = new Array();
             for(var i=0;i<productTypeList.length;i++){
                productTypeArray.push(productTypeList[i].FName);
             }
             $scope.productTypeList=productTypeArray;

             var agentArray = new Array();
             for(var i=0;i<agentList.length;i++){
                agentArray.push(agentList[i].FName);
             }
             $scope.agentList=agentArray;

             var hospitalArray = new Array();
             for(var i=0;i<hospitalList.length;i++){
                hospitalArray.push(hospitalList[i].FName);
             }
             $scope.hospitalList=hospitalArray;

    	 	$scope.submit=function(){
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

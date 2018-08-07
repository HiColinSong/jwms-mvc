/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('addNewHuCtrl', ['$scope', '$modalInstance','utilSvc','bxService','pkgMtlList',
    	 function($scope,$modalInstance,utilSvc,apiSvc,pkgMtlList){
             $scope.pkgMtlList=pkgMtlList;
    	 	$scope.addNewHu=function(){

                apiSvc.createHu({MaterialCode:$scope.temp.material.MaterialCode,
                                 DONumber:$scope.DONumber,
                                 NumOfHu:$scope.temp.newHuNo,
                                 createdOn:utilSvc.formatDateTime()})
                .$promise.then(function(huList){
                    if (huList){
                        $modalInstance.close(huList);
                    } else {
                        utilSvc.addAlert("The Operation failed!", "fail", false);
                    }
                },
                function(err){
                    utilSvc.addAlert("The operation failed!", "fail", false);
                })
    	 	}
    }])
 }());

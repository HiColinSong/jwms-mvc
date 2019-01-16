/*jm - Controllers.js - Colin 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('jm.controllers')
    .controller('addEditSaleForecastCtrl', ['$scope','$rootScope', '$modalInstance','utilSvc','jmService','saleForecast','saleForecastList','productTypeList','hospitalList','salerList','constants',
    	 function($scope,$rootScope,$modalInstance,utilSvc,apiSvc,saleForecast,saleForecastList,productTypeList,hospitalList,salerList,constants){

             $scope.type=saleForecast?"Edit":"Add";
             $scope.productTypeList=productTypeList;
             /* $scope.productTypeName = constants.productTypeName */
             $scope.hospitalList=hospitalList;
             $scope.FHospName = constants.FHospName

             $scope.salerList=salerList;
             /* $scope.FEmpName=constants.FEmpName */
            
             /* $scope.Month=constants.Month
             $scope.Year=constants.Year
             $scope.Aprice=constants.Aprice
             $scope.Aamout=constants.Aamout

             $scope.Fnote=constants.Fnote */

             $scope.uniqueValidation=function(){
                $scope.duplicateUserID=false;
                if ($scope.saleForecast.Date != ''){
                    var date;
                    if($scope.saleForecast.Date.indexOf("年")>-1){
                        let date_str = $scope.saleForecast.Date.replace(/年/g,"/");
                        date_str = date_str.replace(/月/g,"");
                        date = new Date(date_str);
                    } else {
                        date = new Date($scope.saleForecast.Date);
                    }
                    var year = date.getFullYear();
                    var month = date.getMonth()+1;
                    saleForecastList.forEach(_saleForecast => {
                        if (_saleForecast.FHospName===$scope.saleForecast.FHospName && _saleForecast.FEmpName===$scope.saleForecast.FEmpName && _saleForecast.ProductTypeName===$scope.saleForecast.ProductTypeName &&  _saleForecast.Year ===year && _saleForecast.Month ===month){
                            $scope.duplicateUserID=true;
                        }
                    });
                }
            }

    	 	$scope.submit=function(){
                $scope.saleForecast.maintainerName = $rootScope.authUser.userName;
                apiSvc.addEditSaleForecast({saleForecast:$scope.saleForecast})
                .$promise.then(function(saleForecastList){
                    if (saleForecastList){
                        $modalInstance.close(saleForecastList);
                    } else {
                        utilSvc.addAlert("The Operation failed!", "fail", false);
                    }
                },
                function(err){
                    utilSvc.addAlert("The operation failed!", "fail", false);
                })
             }
    	 	$scope.reset=function(){
                $scope.saleForecast={};
                angular.copy(saleForecast,$scope.saleForecast);
                $scope.duplicateUserID=false;
                if(saleForecast){
                    $scope.saleForecast.FHospName=saleForecast.FHospName;
                    $scope.saleForecast.ProductTypeName=saleForecast.ProductTypeName;
                    $scope.saleForecast.Date=saleForecast.Year + '年' + saleForecast.Month + '月';
                    $scope.saleForecast.Aprice=saleForecast.Aprice;
                    $scope.saleForecast.ODActivity=saleForecast.Aamout;
                    $scope.saleForecast.Fnote=saleForecast.Fnote;
                } else {
                    $scope.saleForecast.FHospName='';
                    $scope.saleForecast.ProductTypeName='';
                    $scope.saleForecast.Date='';
                    $scope.saleForecast.Aprice='';
                    $scope.saleForecast.Aamout='';
                    $scope.saleForecast.Fnote='';
                }
             }
             $scope.reset();
    }])
 }());

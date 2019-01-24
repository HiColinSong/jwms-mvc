/*jm - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('jm.controllers')
    .controller('budgetAndIncomeReportCtrl',['$scope','$routeParams','$location', 'report', 'productTypeList','hospitalList','utilSvc','constants',
        function($scope,$routeParams,$location,report,productTypeList,hospitalList,utilSvc,constants){
          $scope.temp={};
          $scope.saleForecastSearch={};          
          if (report){
            $scope.report=report.BudgetAndIncomeData;
            $scope.itemPerPage = constants.pageMessage.itemPerPage;
            $scope.currentPage = constants.pageMessage.currentPage;
            $scope.maxSize = constants.pageMessage.maxSize;
            $scope.pageChanged=function(){              
                $scope.reportListByPage=[];
                var startData = $scope.itemPerPage * ($scope.currentPage-1);
                var endData = $scope.itemPerPage * $scope.currentPage-1;
                $scope.totalItems = $scope.report.length;
                if(endData>$scope.report.length){
                    endData = $scope.report.length-1
                }
                var num = 0;                          
                if($scope.report){                  
                    for(var i = startData;i<=endData;i++){                      
                       if($scope.report[i]!=undefined){                          
                            $scope.reportListByPage[num]=$scope.report[i];
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
                //add leading 0 to the scanned order no
                $location.path("/budgetAndIncomeReport/"+utilSvc.formatDate($scope.temp.dt)+"/"+$scope.saleForecastSearch.ProductTypeName+"/"+$scope.saleForecastSearch.FHospName);

                // $rootScope.dateQuery = utilSvc.formatDate($scope.temp.dt);
                // $rootScope.productTypeNameQuery = $scope.saleForecastSearch.ProductTypeName;
                // $rootScope.fHospNameQuery = $scope.saleForecastSearch.FHospName;
              }
            }
          //   $scope.adjustmentData=function(){
          //     $scope.saleForecastListByPage=[];
          //     var startData = $scope.itemPerPage * ($scope.currentPage-1);
          //     var endData = $scope.itemPerPage * $scope.currentPage-1;
          //     $scope.totalItems = $scope.report.length;
          //     if(endData>$scope.report.length){
          //         endData = $scope.report.length-1
          //     }
          //     var num = 0;
          //     if($scope.report){
          //         for(var i = startData;i<=endData;i++){
          //             if($scope.report[i]!=undefined){
          //                 $scope.saleForecastListByPage[num]=$scope.report[i];
          //             }
          //             num++;
          //         }
          //     }
          // };
    }])
 }());

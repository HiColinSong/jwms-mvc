/*jm - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('jm.controllers')
    .controller('performanceReportCtrl',['$scope','$routeParams','$location', 'report','utilSvc','constants',
        function($scope,$routeParams,$location,report,utilSvc,constants){
          $scope.temp={};
          $scope.reportByPage={};
          if (report){
            $scope.report=report;
            $scope.itemPerPage = constants.pageMessage.itemPerPage;
            $scope.currentPage = constants.pageMessage.currentPage;
            $scope.maxSize = constants.pageMessage.maxSize;
            $scope.pageChanged=function(){
              $scope.reportByPage.SFE_ImplantData=[];
              var startData = $scope.itemPerPage * ($scope.currentPage-1);
              var endData = $scope.itemPerPage * $scope.currentPage-1;
              $scope.totalItems = $scope.report.SFE_ImplantData.length;
              if(endData>$scope.report.SFE_ImplantData.length){
                  endData = $scope.report.SFE_ImplantData.length-1
              }
              var num = 0;
              if($scope.report.SFE_ImplantData){
                  for(var i = startData;i<=endData;i++){
                      if($scope.report.SFE_ImplantData[i]!=undefined){
                          $scope.reportByPage.SFE_ImplantData[num]=$scope.report.SFE_ImplantData[i];
                      }
                      num++;
                  }
              }
          };
          $scope.pageChanged();
          } else {
              $scope.clear = function () {
                $scope.temp.dt = null;
              };
              $scope.submitForm = function() {
                //add leading 0 to the scanned order no
                $location.path("/report/"+utilSvc.formatDate($scope.temp.dt));
            }
          }
    }])
 }());

/*jm - App.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    
    angular.module('jm')                
    .config(['$routeProvider',
        function($routeProvider) {
            $routeProvider
            .when('/home', {
                templateUrl: 'partials/home.html',
                controller: 'homeCtrl'
            })
            .when('/report/:date?', {
                templateUrl: 'partials/performance-report.html',
                controller: 'performanceReportCtrl',
                resolve:{
                    report:['$q','$route','utilSvc','jmService',
                        function($q,$route,util,apiSvc){
                            var deferred = $q.defer();
                            if ($route.current.params.date){
                                util.pageLoading("start");
                            apiSvc.getPerformanceReport({date:$route.current.params.date}).$promise.then(function(data){
                                if (data){
                                    deferred.resolve(data);
                                } else {
                                    deferred.resolve(undefined);
                                }
                                util.pageLoading("stop");
                            },function(err){
                                deferred.reject(err);
                                util.pageLoading("stop");
                            })
                        } else {
                            deferred.resolve(undefined)
                            util.pageLoading("stop");
                        }
                            return deferred.promise;
                        }]
                }
            })
            .when('/budgetAndIncomeReport/:date?', {
                templateUrl: 'partials/budgetAndIncome-report.html',
                controller: 'budgetAndIncomeReportCtrl',
                resolve:{
                    report:['$q','$route','utilSvc','jmService',
                        function($q,$route,util,apiSvc){
                            var deferred = $q.defer();
                            if ($route.current.params.date){
                                util.pageLoading("start");
                               // debugger;
                            apiSvc.getBudgetAndIncomeReport({date:$route.current.params.date}).$promise.then(function(data){
                                if (data){
                                    deferred.resolve(data);
                                } else {
                                    deferred.resolve(undefined);
                                }
                                util.pageLoading("stop");
                            },function(err){
                                deferred.reject(err);
                                util.pageLoading("stop");
                            })
                        } else {
                            deferred.resolve(undefined)
                            util.pageLoading("stop");
                        }
                            return deferred.promise;
                        }]
                }
            })
            .when('/budgetAndIncomeDetailReport/:date?', {
                templateUrl: 'partials/budgetAndIncomeDetail-report.html',
                controller: 'budgetAndIncomeDetailReportCtrl',
                resolve:{
                    report:['$q','$route','utilSvc','jmService',
                        function($q,$route,util,apiSvc){
                            var deferred = $q.defer();
                            if ($route.current.params.date){
                                util.pageLoading("start");
                           //    debugger;
                            apiSvc.getBudgetAndIncomeReport({date:$route.current.params.date}).$promise.then(function(data){
                                if (data){
                                    deferred.resolve(data);
                                } else {
                                    deferred.resolve(undefined);
                                }
                                util.pageLoading("stop");
                            },function(err){
                                deferred.reject(err);
                                util.pageLoading("stop");
                            })
                        } else {
                            deferred.resolve(undefined)
                            util.pageLoading("stop");
                        }
                            return deferred.promise;
                        }]
                }
            })
            .when('/admin', {
                templateUrl: 'partials/admin.html',
                controller: 'adminCtrl',
                resolve:{
                    userList:['$q','jmService','utilSvc',
                        function($q,apiSvc,util){
                            var deferred = $q.defer();
                            util.pageLoading("start");
                            apiSvc.getUserList().$promise.then(function(data){
                                if (data){
                                    deferred.resolve(data);
                                } else {
                                    deferred.resolve(undefined);
                                }
                                util.pageLoading("stop");
                            },function(err){
                                deferred.reject(err);
                                util.pageLoading("stop");
                            })
                            return deferred.promise;
                        }]
                }
            })
            .when('/saleForecast', {
                templateUrl: 'partials/saleForecast.html',
                controller: 'saleForecastCtrl',
                resolve:{
                    saleForecastList:['$q','jmService','utilSvc',
                        function($q,apiSvc,util){
                            var deferred = $q.defer();
                            util.pageLoading("start");
                            apiSvc.getSaleForecastList().$promise.then(function(data){
                                if (data){
                                    deferred.resolve(data);
                                } else {
                                    deferred.resolve(undefined);
                                }
                                util.pageLoading("stop");
                            },function(err){
                                deferred.reject(err);
                                util.pageLoading("stop");
                            })                           
                            return deferred.promise;
                        }]
                }
            })
            .when('/businessPriceMaintenance', {
                templateUrl: 'partials/businessPrice-report.html',
                controller: 'businessPriceCtrl',
                resolve:{
                    businessPriceList:['$q','jmService','utilSvc',
                        function($q,apiSvc,util){
                            var deferred = $q.defer();
                            util.pageLoading("start");
                            apiSvc.getBusinessPriceList().$promise.then(function(data){
                                if (data){
                                    deferred.resolve(data);
                                } else {
                                    deferred.resolve(undefined);
                                }
                                util.pageLoading("stop");
                            },function(err){
                                deferred.reject(err);
                                util.pageLoading("stop");
                            })
                            return deferred.promise;
                        }]
                }
            })
            .when('/promotionDiscountMaintenance', {
                templateUrl: 'partials/promotionDiscount-report.html',
                controller: 'promotionDiscountCtrl',
                resolve:{
                    promotionDiscountList:['$q','jmService','utilSvc',
                        function($q,apiSvc,util){
                            var deferred = $q.defer();
                            util.pageLoading("start");
                            apiSvc.getPromotionDiscountList().$promise.then(function(data){
                                if (data){
                                    deferred.resolve(data);
                                } else {
                                    deferred.resolve(undefined);
                                }
                                util.pageLoading("stop");
                            },function(err){
                                deferred.reject(err);
                                util.pageLoading("stop");
                            })
                            return deferred.promise;
                        }]
                }
            })
            .when('/view-error-log', {
                templateUrl: 'partials/view-log.html',
                controller: 'viewLogCtrl',
                resolve:{
                    logs:['$q','jmService','utilSvc',
                    function($q,apiSvc,util){
                            var deferred = $q.defer();
                            util.pageLoading("start");
                            apiSvc.viewErrorLog({type:"error-log"}).$promise.then(function(data){
                                if (data){
                                    deferred.resolve(data);
                                } else {
                                    deferred.resolve(undefined);
                                }
                                util.pageLoading("stop");
                            },function(err){
                                deferred.reject(err);
                                util.pageLoading("stop");
                            })
                            return deferred.promise;
                        }]
                }
            })
            .when('/view-info-log', {
                templateUrl: 'partials/view-log.html',
                controller: 'viewLogCtrl',
                resolve:{
                    logs:['$q','jmService','utilSvc',
                    function($q,apiSvc,util){
                            var deferred = $q.defer();
                            util.pageLoading("start");
                            apiSvc.viewInfoLog({type:"info-log"}).$promise.then(function(data){
                                if (data){
                                    deferred.resolve(data);
                                } else {
                                    deferred.resolve(undefined);
                                }
                                util.pageLoading("stop");
                            },function(err){
                                deferred.reject(err);
                                util.pageLoading("stop");
                            })
                            return deferred.promise;
                        }]
                }
            })
            .otherwise({
                redirectTo: '/home'
            })
        }
    ])
}());


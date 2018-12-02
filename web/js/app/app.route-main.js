/*bx - App.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    
    angular.module('bx')                
    .config(['$routeProvider',
        function($routeProvider) {
            $routeProvider
            .when('/home', {
                templateUrl: 'partials/home.html',
                controller: 'homeCtrl'
            })
            .when('/report', {
                templateUrl: 'partials/performance-report.html',
                controller: 'performanceReportCtrl',
                resolve:{
                    report:['$q','bxService',
                        function($q,apiSvc){
                            var deferred = $q.defer();
                            apiSvc.getPerformanceReport().$promise.then(function(data){
                                if (data){
                                    deferred.resolve(data);
                                } else {
                                    deferred.resolve(undefined);
                                }
                            },function(err){
                                deferred.reject(err);
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


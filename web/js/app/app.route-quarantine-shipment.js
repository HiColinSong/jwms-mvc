/*bx - App.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    
    angular.module('bx')                
    .config(['$routeProvider',
        function($routeProvider) {
            $routeProvider
            .when('/qrsmt', {templateUrl: 'partials/quarantine-shipment.html'})
            .when('/qrsmt/planning', {
                templateUrl: 'partials/subconOrders.html',
                controller: 'subconOrdersForPlannerCtrl'
            })
            .when('/qrsmt/planning/:qsNo?', {
                templateUrl: 'partials/qrsmt-planning.html',
                controller: 'qrsmtPlanningCtrl',
                resolve:{
                    plans:['$q','$route','utilSvc','bxService',
                    function($q,$route,utilSvc,apiSvc){
                        var deferred = $q.defer();
                        if ($route.current.params.qsNo){
                            utilSvc.pageLoading("start");
                            apiSvc.getSubconWorkOrderForPlanner({qsNo:$route.current.params.qsNo})
                            .$promise.then(function(data){
                                if (data){
                                    deferred.resolve(data.plans);
                                } else {
                                    deferred.resolve(undefined);
                                }
                                utilSvc.pageLoading("stop");
                            },function(err){
                                if (err.data&&err.data.message){
                                    utilSvc.addAlert(err.data.message, "fail", true);
                                }
                                deferred.reject(err);
                                utilSvc.pageLoading("stop");
                            })
                        } else {
                            deferred.resolve(undefined)
                            utilSvc.pageLoading("stop");
                        }
                        return deferred.promise;
                    }]                   
                }
            })
            .when('/qrsmt/prepack', {
                templateUrl: 'partials/subconOrders.html',
                controller: 'subconOrdersForPrepackCtrl'
            })
            .when('/qrsmt/prepack/:qsNo?', {
                templateUrl: 'partials/qrsmt-prepack.html',
                controller: 'qrsmtPrepackCtrl',
                resolve:{
                    orders:['$q','$route','utilSvc','bxService',
                    function($q,$route,utilSvc,apiSvc){
                        var deferred = $q.defer();
                        if ($route.current.params.qsNo){
                            utilSvc.pageLoading("start");
                            apiSvc.getPrepackOrder({qsNo:$route.current.params.qsNo})
                            .$promise.then(function(data){
                                if (data){
                                    deferred.resolve(data);
                                } else {
                                    deferred.resolve(undefined);
                                }
                                utilSvc.pageLoading("stop");
                            },function(err){
                                if (err.data&&err.data.message){
                                    utilSvc.addAlert(err.data.message, "fail", true);
                                }
                                deferred.reject(err);
                                utilSvc.pageLoading("stop");
                            })
                        } else {
                            deferred.resolve(undefined)
                            utilSvc.pageLoading("stop");
                        }
                        return deferred.promise;
                    }]                   
                }
            })
        }
    ])
}());


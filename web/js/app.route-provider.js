/*bx - App.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    
    angular.module('bx')                
    .config(['$routeProvider',
        function($routeProvider) {
            $routeProvider
            .when('/home', {
                templateUrl: 'partials/home.html',
                controller: 'homeCtrl',
                resolve:{
                }
            })
            .when('/receiving', {templateUrl: 'partials/receving.html'})
            .when('/fulfillment', {templateUrl: 'partials/fulfillment.html'})
            .when('/receiving/spoReceipts/:categoryId?', {
                templateUrl: 'partials/spoReceipts.html',
                controller: 'spoReceiptsCtrl'
            })
            .when('/receiving/rtgReceipts/:DONumber?', {
                templateUrl: 'partials/rtgReceipts.html',
                controller: 'rtgReceiptsCtrl',
                resolve:{
                    order:['$q','$route','utilSvc','bxService',
                        function($q,$route,utilSvc,apiSvc){
                            var deferred = $q.defer();
                            if ($route.current.params.DONumber){
                                utilSvc.pageLoading("start");
                                apiSvc.getRtgDeliveryOrder({orderNo:$route.current.params.DONumber}).$promise.then(function(data){
                                    if (data){
                                        deferred.resolve(data);
                                        utilSvc.pageLoading("stop");
                                    } else {
                                        deferred.resolve(undefined);
                                        utilSvc.pageLoading("stop");
                                    }
                                },function(err){
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
            .when('/fulfillment/picking/:TONumber?', {
                templateUrl: 'partials/picking.html',
                controller: 'pickingCtrl',
                resolve:{
                    order:['$q','$route','utilSvc','bxService',
                        function($q,$route,util,apiSvc){
                            var deferred = $q.defer();
                            if ($route.current.params.TONumber){
                                util.pageLoading("start");
                                apiSvc.getOrderForPicking({orderNo:$route.current.params.TONumber}).$promise.then(function(data){
                                    if (data){
                                        deferred.resolve(data);
                                        util.pageLoading("stop");
                                    } else {
                                        deferred.resolve(undefined);
                                        util.pageLoading("stop");
                                    }
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
            .when('/fulfillment/packing/:DONumber?', {
                templateUrl: 'partials/packing.html',
                controller: 'packingCtrl',
                resolve:{
                    order:['$q','$route','bxService','utilSvc',
                        function($q,$route,apiSvc,utilSvc){
                            var deferred = $q.defer();
                            if ($route.current.params.DONumber){
                                utilSvc.pageLoading("start");
                                apiSvc.getOrderForPacking(
                                    {orderNo:$route.current.params.DONumber,
                                     PackStart:utilSvc.formatDate()}
                                ).$promise.then(function(data){
                                    if (data){
                                        deferred.resolve(data);
                                        utilSvc.pageLoading("stop");
                                    } else {
                                        deferred.resolve(undefined);
                                        utilSvc.pageLoading("stop");
                                    }
                                },function(err){
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
            .when('/fulfillment/tools/:toolType?', {
                templateUrl: 'partials/tools.html',
                controller: 'toolsCtrl'
            })
            .otherwise({
                redirectTo: '/home'
            })
        }
    ])
}());


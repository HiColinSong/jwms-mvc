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
            .when('/receiving', {templateUrl: 'partials/empty.html'})
            .when('/fulfillment', {templateUrl: 'partials/empty.html'})
            .when('/receiving/spoReceipts/:categoryId?', {
                templateUrl: 'partials/spoReceipts.html',
                controller: 'spoReceiptsCtrl'
            })
            .when('/receiving/rtgReceipts/:orderNo?', {
                templateUrl: 'partials/rtgReceipts.html',
                controller: 'rtgReceiptsCtrl',
                resolve:{
                    order:['$q','$route','bxService',
                        function($q,$route,apiSvc){
                            var deferred = $q.defer();
                            if ($route.current.params.orderNo){
                                apiSvc.getRtgDeliveryOrder({param1:$route.current.params.orderNo}).$promise.then(function(data){
                                    if (data){
                                        deferred.resolve(data);
                                    } else {
                                        deferred.resolve(undefined);
                                    }
                                },function(err){
                                    deferred.reject(err);
                                })
                            } else {
                                deferred.resolve(undefined)
                            }
                            return deferred.promise;
                        }]
                }
            })
            .when('/fulfillment/picking/:orderNo?', {
                templateUrl: 'partials/picking.html',
                controller: 'pickingCtrl',
                resolve:{
                    order:['$q','$route','bxService',
                        function($q,$route,apiSvc){
                            var deferred = $q.defer();
                            if ($route.current.params.orderNo){
                                apiSvc.getOrderForPicking({param1:$route.current.params.orderNo}).$promise.then(function(data){
                                    if (data){
                                        deferred.resolve(data);
                                    } else {
                                        deferred.resolve(undefined);
                                    }
                                },function(err){
                                    deferred.reject(err);
                                })
                            } else {
                                deferred.resolve(undefined)
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
                                apiSvc.getOrderForPacking(
                                    {orderNo:$route.current.params.DONumber,
                                     PackStart:utilSvc.formatDate()}
                                ).$promise.then(function(data){
                                    if (data){
                                        deferred.resolve(data);
                                    } else {
                                        deferred.resolve(undefined);
                                    }
                                },function(err){
                                    deferred.reject(err);
                                })
                            } else {
                                deferred.resolve(undefined)
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


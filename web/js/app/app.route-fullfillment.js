/*bx - App.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    
    angular.module('bx')                
    .config(['$routeProvider',
        function($routeProvider) {
            $routeProvider
            .when('/fulfillment', {templateUrl: 'partials/fulfillment.html'})

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
                                    deferred.resolve({error:err,message:err.data.message});
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
            .when('/fulfillment/picking-reversals/:TONumber?', {
                templateUrl: 'partials/picking-reversals.html',
                controller: 'pickingReversalsCtrl',
                resolve:{
                    order:['$q','$route','utilSvc','bxService',
                        function($q,$route,util,apiSvc){
                            var deferred = $q.defer();
                            if ($route.current.params.TONumber){
                                util.pageLoading("start");
                                apiSvc.getOrderForPickingReversals({orderNo:$route.current.params.TONumber}).$promise.then(function(data){
                                    if (data){
                                        deferred.resolve(data);
                                        util.pageLoading("stop");
                                    } else {
                                        deferred.resolve(undefined);
                                        util.pageLoading("stop");
                                    }
                                },function(err){
                                    deferred.resolve({error:err,message:err.data.message});
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
                                     PackStart:utilSvc.formatDateTime()}
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
            .when('/fulfillment/reservation/:resvNo?', {
                templateUrl: 'partials/reservation.html',
                controller: 'reservationCtrl',
                resolve:{
                    resvDoc:['$q','$route','bxService','utilSvc',
                        function($q,$route,apiSvc,utilSvc){
                            var deferred = $q.defer();
                            if ($route.current.params.resvNo){
                                utilSvc.pageLoading("start");
                                apiSvc.getReservationDoc(
                                    {resvNo:$route.current.params.resvNo}
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
                                    utilSvc.addAlert("The reservation "+$route.current.params.resvNo+" doesn't exist!", "fail", false);
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
        }
    ])
}());


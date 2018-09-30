/*bx - App.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    
    angular.module('bx')                
    .config(['$routeProvider',
        function($routeProvider) {
            $routeProvider
            .when('/receiving', {templateUrl: 'partials/receiving.html'})
            .when('/receiving/spoReceipts', {
                templateUrl: 'partials/subconOrders.html',
                controller: 'subconOrdersCtrl'
            })
            .when('/receiving/spoReceipts/:orderNo?', {
                templateUrl: 'partials/spoReceipts.html',
                controller: 'spoReceiptsCtrl',
                resolve:{
                    info:['$q','$route','utilSvc','bxService',
                    function($q,$route,utilSvc,apiSvc){
                        var deferred = $q.defer();
                        if ($route.current.params.orderNo){
                            utilSvc.pageLoading("start");
                            apiSvc.getSubconWorkOrderInfo({orderNo:$route.current.params.orderNo})
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
            .when('/receiving/spoLotRelease', {
                templateUrl: 'partials/subconOrders.html',
                controller: 'subconOrdersCtrl'
            })
            .when('/receiving/spoLotRelease/:orderNo?', {
                templateUrl: 'partials/spo-lot-release.html',
                controller: 'spoLotReleaseCtrl',
                resolve:{
                    info:['$q','$route','utilSvc','bxService',
                    function($q,$route,utilSvc,apiSvc){
                        var deferred = $q.defer();
                        if ($route.current.params.orderNo){
                            utilSvc.pageLoading("start");
                            apiSvc.getLotReleaseTable({orderNo:$route.current.params.orderNo})
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
            .when('/receiving/rtgReceipts/:DONumber?', {
                templateUrl: 'partials/rtgReceipts.html',
                controller: 'rtgReceiptsCtrl',
                // bannedRoles:['qaLab','qaAdmin','DocControlQA'],
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
            .when('/receiving/rtgReceipts-reversals/:DONumber?', {
                templateUrl: 'partials/rtgReceipts-reversals.html',
                controller: 'rtgReceiptsReversalsCtrl'
            })
        }
    ])
}());


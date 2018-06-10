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
            .when('/receiving', {templateUrl: 'partials/receiving.html'})
            .when('/fulfillment', {templateUrl: 'partials/fulfillment.html'})
            .when('/receiving/spoReceipts', {
                templateUrl: 'partials/subconOrders.html',
                controller: 'subconOrdersCtrl'
                // resolve:{
                //     list:['$q','$route','utilSvc','bxService',
                //     function($q,$route,utilSvc,apiSvc){
                //         var deferred = $q.defer();
                //         if ($route.current.params.shipToTarget){
                //             apiSvc.getSubconOrderList()
                //             .$promise.then(function(data){
                //                 if (data){
                //                     deferred.resolve(data);
                //                 } else {
                //                     deferred.resolve(undefined);
                //                 }
                //             },function(err){
                //                 deferred.reject(err);
                //             })
                //         } else {
                //             deferred.resolve(undefined)
                //         }
                //         return deferred.promise;
                //     }]                   
                // }
            })
            .when('/receiving/spoReceipts/:orderNo?', {
                templateUrl: 'partials/spoReceipts.html',
                controller: 'spoReceiptsCtrl',
                resolve:{
                    info:['$q','$route','utilSvc','bxService',
                    function($q,$route,utilSvc,apiSvc){
                        var deferred = $q.defer();
                        if ($route.current.params.orderNo){
                            apiSvc.getSubconWorkOrderInfo({orderNo:$route.current.params.orderNo})
                            .$promise.then(function(data){
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
            // .when('/receiving/spoReceipts/:shipToTarget?', {
            //     templateUrl: 'partials/spoReceipts.html',
            //     controller: 'spoReceiptsCtrl',
            //     resolve:{
            //         list:['$q','$route','utilSvc','bxService',
            //         function($q,$route,utilSvc,apiSvc){
            //             var deferred = $q.defer();
            //             if ($route.current.params.shipToTarget){
            //                 apiSvc.getSubconPendingList({sShip2Target:$route.current.params.shipToTarget})
            //                 .$promise.then(function(data){
            //                     if (data){
            //                         deferred.resolve(data);
            //                     } else {
            //                         deferred.resolve(undefined);
            //                     }
            //                 },function(err){
            //                     deferred.reject(err);
            //                 })
            //             } else {
            //                 deferred.resolve(undefined)
            //             }
            //             return deferred.promise;
            //         }]                   
            //     }
            // })
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
            .when('/receiving/rtgReceipts-reversals/:DONumber?', {
                templateUrl: 'partials/rtgReceipts-reversals.html',
                controller: 'rtgReceiptsReversalsCtrl'
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
            .when('/admin', {
                templateUrl: 'partials/admin.html',
                controller: 'adminCtrl',
                resolve:{
                    userList:['$q','bxService',
                        function($q,apiSvc){
                            var deferred = $q.defer();
                            apiSvc.getUserList().$promise.then(function(data){
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
            .when('/view-error-log', {
                templateUrl: 'partials/view-log.html',
                controller: 'viewLogCtrl',
                resolve:{
                    logs:['$q','bxService',
                        function($q,apiSvc){
                            var deferred = $q.defer();
                            apiSvc.viewLog().$promise.then(function(data){
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


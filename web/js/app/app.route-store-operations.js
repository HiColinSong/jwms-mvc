/*bx - App.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    
    angular.module('bx')                
    .config(['$routeProvider',
        function($routeProvider) {
            $routeProvider
            .when('/store-ops', {templateUrl: 'partials/store-ops.html'})
            // .when('/store-ops/counting-im', {
            //     templateUrl: 'partials/counting-im.html',
            //     controller: 'countingImCtrl',
            //     resolve:{
            //         piDoc:undefined
            //     }
            // })
            .when('/store-ops/counting-im/:docNo?/:fiscalYear?', {
                templateUrl: 'partials/counting-im.html',
                controller: 'countingImCtrl',
                resolve:{
                    piDoc:['$q','$route','utilSvc','bxService',
                    function($q,$route,utilSvc,apiSvc){
                        var deferred = $q.defer();
                        if ($route.current.params.docNo&&$route.current.params.fiscalYear){
                            utilSvc.pageLoading("start");
                            apiSvc.getCountingDoc(
                                {subtype:"counting-im"},
                                {docNo:$route.current.params.docNo,fiscalYear:$route.current.params.fiscalYear}
                            ).$promise.then(function(data){
                                if (data){
                                    deferred.resolve(data);
                                } else {
                                    deferred.resolve(undefined);
                                }
                                utilSvc.pageLoading("stop");
                            },function(err){
                                // if (err.data&&err.data.message){
                                //     utilSvc.addAlert(err.data.message, "fail", true);
                                // }
                                // deferred.reject(err);
                                deferred.resolve(err);
                                utilSvc.pageLoading("stop");
                            })
                        } else {
                            deferred.resolve(undefined)
                        }
                        return deferred.promise;
                    }]  
                }
            })

            .when('/store-ops/counting-wm/:docNo?', {
                templateUrl: 'partials/counting-wm.html',
                controller: 'countingWmCtrl',
                resolve:{
                    piDoc:['$q','$route','utilSvc','bxService',
                    function($q,$route,utilSvc,apiSvc){
                        var deferred = $q.defer();
                        if ($route.current.params.docNo){
                            utilSvc.pageLoading("start");
                            apiSvc.getCountingDoc( {subtype:"counting-wm"},{docNo:$route.current.params.docNo})
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
            .when('/store-ops/consolidated-udi', {
                templateUrl: 'partials/consolidated-udi.html',
                controller: 'consolidatedUdiCtrl'
            })
        }
    ])
}());


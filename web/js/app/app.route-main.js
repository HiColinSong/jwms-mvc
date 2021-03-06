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
            .when('/budgetAndIncomeReport/:date?/:ProductTypeName?/:FHospName?', {
                templateUrl: 'partials/budget-and-income-report.html',
                controller: 'budgetAndIncomeReportCtrl',
                resolve:{                    
                    productTypeList:['$q','$route','jmService','utilSvc',
                            function($q,$route,apiSvc,util){
                                var deferred = $q.defer();
                                //util.pageLoading("start");
                                apiSvc.getProductType().$promise.then(function(data){
                                    if (data){
                                        deferred.resolve(data);
                                    } else {
                                        deferred.resolve(undefined);
                                    }
                                    //util.pageLoading("stop");
                                },function(err){
                                    deferred.reject(err);
                                    //util.pageLoading("stop");
                                })
                                return deferred.promise;
                            }],
                            hospitalList:['$q','jmService','utilSvc',
                            function($q,apiSvc,util){
                                var deferred = $q.defer();
                                //util.pageLoading("start");
                                apiSvc.getHospital().$promise.then(function(data){
                                    if (data){
                                        deferred.resolve(data);
                                    } else {
                                        deferred.resolve(undefined);
                                    }
                                    //util.pageLoading("stop");
                                },function(err){
                                    deferred.reject(err);
                                    //util.pageLoading("stop");
                                })
                                return deferred.promise;
                            }],
                    report:['$q','$route','utilSvc','jmService',
                        function($q,$route,util,apiSvc){
                            var deferred = $q.defer();
                            if ($route.current.params.date){
                                util.pageLoading("start");
                            apiSvc.getBudgetAndIncomeReport({date:$route.current.params.date,FHospName:$route.current.params.FHospName,ProductTypeName:$route.current.params.ProductTypeName}).$promise.then(function(data){
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
            .when('/budgetAndIncomeDetailReport/:date?/:ProductTypeName?/:FHospName?', {
                templateUrl: 'partials/budget-and-income-detail-report.html',
                controller: 'budgetAndIncomeDetailReportCtrl',
                resolve:{
                    productTypeList:['$q','$route','jmService','utilSvc',
                            function($q,$route,apiSvc,util){
                                var deferred = $q.defer();
                                //util.pageLoading("start");
                                apiSvc.getProductType().$promise.then(function(data){
                                    if (data){
                                        deferred.resolve(data);
                                    } else {
                                        deferred.resolve(undefined);
                                    }
                                    //util.pageLoading("stop");
                                },function(err){
                                    deferred.reject(err);
                                    //util.pageLoading("stop");
                                })
                                return deferred.promise;
                            }],
                            hospitalList:['$q','jmService','utilSvc',
                            function($q,apiSvc,util){
                                var deferred = $q.defer();
                                //util.pageLoading("start");
                                apiSvc.getHospital().$promise.then(function(data){
                                    if (data){
                                        deferred.resolve(data);
                                    } else {
                                        deferred.resolve(undefined);
                                    }
                                    //util.pageLoading("stop");
                                },function(err){
                                    deferred.reject(err);
                                    //util.pageLoading("stop");
                                })
                                return deferred.promise;
                            }],
                    report:['$q','$route','utilSvc','jmService',
                        function($q,$route,util,apiSvc){
                            var deferred = $q.defer();
                            if ($route.current.params.date){
                                util.pageLoading("start");
                            apiSvc.getBudgetAndIncomeReport({date:$route.current.params.date,FHospName:$route.current.params.FHospName,ProductTypeName:$route.current.params.ProductTypeName}).$promise.then(function(data){
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
            .when('/saleForecast/:date?/:ProductTypeName?/:FHospName?', {
                templateUrl: 'partials/saleForecast.html',
                controller: 'saleForecastCtrl',
                resolve:{
                    productTypeList:['$q','$route','jmService','utilSvc',
                            function($q,$route,apiSvc,util){
                                var deferred = $q.defer();
                                //util.pageLoading("start");
                                apiSvc.getProductType().$promise.then(function(data){
                                    if (data){
                                        deferred.resolve(data);
                                    } else {
                                        deferred.resolve(undefined);
                                    }
                                    //util.pageLoading("stop");
                                },function(err){
                                    deferred.reject(err);
                                    //util.pageLoading("stop");
                                })
                                return deferred.promise;
                            }],
                    hospitalList:['$q','jmService','utilSvc',
                        function($q,apiSvc,util){
                            var deferred = $q.defer();
                            //util.pageLoading("start");
                            apiSvc.getHospital().$promise.then(function(data){
                                if (data){
                                    deferred.resolve(data);
                                } else {
                                    deferred.resolve(undefined);
                                }
                                //util.pageLoading("stop");
                            },function(err){
                                deferred.reject(err);
                                //util.pageLoading("stop");
                            })
                            return deferred.promise;
                        }],
                    saleForecastList:['$q','$route','jmService','utilSvc',
                        function($q,$route,apiSvc,util){
                            var deferred = $q.defer();
                            util.pageLoading("start");
                            if ($route.current.params.date){
                                apiSvc.getSaleForecastList({date:$route.current.params.date,FHospName:$route.current.params.FHospName,ProductTypeName:$route.current.params.ProductTypeName}).$promise.then(function(data){
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
                            }else {
                                deferred.resolve(undefined)
                                util.pageLoading("stop");
                            }                   
                            return deferred.promise;
                        }]
                }
            })
            .when('/businessPriceMaintenance/:date?/:ProductTypeName?/:FHospName?', {
                templateUrl: 'partials/businessPrice-report.html',
                controller: 'businessPriceCtrl',
                resolve:{
                    productTypeList:['$q','$route','jmService','utilSvc',
                            function($q,$route,apiSvc,util){
                                var deferred = $q.defer();
                                //util.pageLoading("start");
                                apiSvc.getProductType().$promise.then(function(data){
                                    if (data){
                                        deferred.resolve(data);
                                    } else {
                                        deferred.resolve(undefined);
                                    }
                                    //util.pageLoading("stop");
                                },function(err){
                                    deferred.reject(err);
                                    //util.pageLoading("stop");
                                })
                                return deferred.promise;
                            }],
                    hospitalList:['$q','jmService','utilSvc',
                        function($q,apiSvc,util){
                            var deferred = $q.defer();
                            //util.pageLoading("start");
                            apiSvc.getHospital().$promise.then(function(data){
                                if (data){
                                    deferred.resolve(data);
                                } else {
                                    deferred.resolve(undefined);
                                }
                                //util.pageLoading("stop");
                            },function(err){
                                deferred.reject(err);
                                //util.pageLoading("stop");
                            })
                            return deferred.promise;
                        }],
                        agentList:['$q','jmService','utilSvc',
                        function($q,apiSvc,util){
                            var deferred = $q.defer();
                            //util.pageLoading("start");
                            apiSvc.getAgent().$promise.then(function(data){
                                if (data){
                                    deferred.resolve(data);
                                } else {
                                    deferred.resolve(undefined);
                                }
                                //util.pageLoading("stop");
                            },function(err){
                                deferred.reject(err);
                                //util.pageLoading("stop");
                            })
                            return deferred.promise;
                        }],
                        businessPriceList:['$q','$route','jmService','utilSvc',
                        function($q,$route,apiSvc,util){
                            var deferred = $q.defer();
                            util.pageLoading("start");
                            if ($route.current.params.date){
                                apiSvc.getBusinessPriceList({date:$route.current.params.date,FHospName:$route.current.params.FHospName,ProductTypeName:$route.current.params.ProductTypeName}).$promise.then(function(data){
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
                            }else {
                                deferred.resolve(undefined)
                                util.pageLoading("stop");
                            }
                            
                            return deferred.promise;
                        }]
                }
            })
            .when('/promotionDiscountMaintenance/:date?/:ProductTypeName?/:FHospName?', {
                templateUrl: 'partials/promotionDiscount-report.html',
                controller: 'promotionDiscountCtrl',
                resolve:{
                    productTypeList:['$q','$route','jmService','utilSvc',
                            function($q,$route,apiSvc,util){
                                var deferred = $q.defer();
                                //util.pageLoading("start");
                                apiSvc.getProductType().$promise.then(function(data){
                                    if (data){
                                        deferred.resolve(data);
                                    } else {
                                        deferred.resolve(undefined);
                                    }
                                    //util.pageLoading("stop");
                                },function(err){
                                    deferred.reject(err);
                                    //util.pageLoading("stop");
                                })
                                return deferred.promise;
                            }],
                        hospitalList:['$q','$route','jmService','utilSvc',
                        function($q,$route,apiSvc,util){
                            var deferred = $q.defer();
                            //util.pageLoading("start");
                            apiSvc.getHospital().$promise.then(function(data){
                                if (data){
                                    deferred.resolve(data);
                                } else {
                                    deferred.resolve(undefined);
                                }
                                //util.pageLoading("stop");
                            },function(err){
                                deferred.reject(err);
                                //util.pageLoading("stop");
                            })
                            return deferred.promise;
                        }],
                    promotionDiscountList:['$q','$route','jmService','utilSvc',
                        function($q,$route,apiSvc,util){
                            var deferred = $q.defer();
                            util.pageLoading("start");
                            if ($route.current.params.date){
                                apiSvc.getPromotionDiscountList({date:$route.current.params.date,FHospName:$route.current.params.FHospName,ProductTypeName:$route.current.params.ProductTypeName}).$promise.then(function(data){
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
                            }else {
                                deferred.resolve(undefined)
                                util.pageLoading("stop");
                            }
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


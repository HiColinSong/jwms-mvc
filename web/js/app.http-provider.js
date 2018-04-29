/*bx - App.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    angular.module('bx')
    .config(['$httpProvider',
            function($httpProvider) {
                $httpProvider.interceptors.push(['$q', '$injector',
                    function($q, $injector,$cookies) {
                        var isLoggingIn = false;
                        return {
                            request: function(config) {
                                config.requestTimestamp = new Date().getTime();
                                return config || $q.when(config);
                            },
                            response:function(response){
                                response.config.responseTimestamp = new Date().getTime();
                                var util = $injector.get("utilSvc");
                                if (util.isServerRequest(response.config.url)){
                                    // console.log("response.config.url="+response.config.url);
                                    var auth = $injector.get("authSvc");
                                    if(response.data&&response.data.loginUser){
                                        auth.setStatus("login",response.data.loginUser,response.data.baseUrl);
                                    } else if(response.data&&"logout"===response.data.loginStatus){
                                         auth.setStatus("logout");
                                    } else {
                                        auth.checkLoginStatus();
                                    }
                                    
                                }
                                return response;
                            },
                            responseError: function(response) {
                                console.log("response.config.url="+response.config.url);
                                if (response.status === 401) {
                                    // redirect to URLs.login
                                    console.log("redirect to URLs.login");
                                    //log user out:
                                    $injector.get("authSvc").setStatus("logout");
                                    $injector.get("modalLogin").do();

                                    // $injector.invoke(['$http', '$modal','$location','$rootScope',
                                    //     function($http, $modal,$location,$rootScope) {
                                    //         var modalInstance = $modal.open({
                                    //             templateUrl: 'partials/loginModal.html',
                                    //             controller: 'loginCtrl'
                                    //         });
                                    //         $rootScope.$on("loginStautsChange",function(){
                                    //             console.log("receive event:loginStautsChange");
                                    //             if (modalInstance)
                                    //                 modalInstance.close();
                                    //         })
                                    //         modalInstance.result.then(function() {
                                    //             isLoggingIn = true;
                                    //             console.log("login resolved");
                                    //         }, function(path) {
                                    //             isLoggingIn = false;
                                    //             console.log("login rejected");
                                    //              $location.path("/home");
                                    //             //redirect to signup page

                                    //         })['finally'](function() {
                                    //             modalInstance = undefined;
                                    //         });
                                    //     }
                                    // ]);
                                    
                                }
                                return $q.reject(response);
                            }
                        };
                    }
                ]);
            }
        ]);
}());


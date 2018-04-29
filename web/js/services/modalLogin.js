/*bx - services.js - Yadong Zhu 2017*/ (function() {
    'use strict';
    angular.module('bx.services')
    .service('modalLogin',['$http', '$modal','$location','$rootScope',
        function($http, $modal,$location,$rootScope) {
            return {
                do:function(){
                    var modalInstance = $modal.open({
                        templateUrl: 'partials/loginModal.html',
                        controller: 'loginCtrl'
                    });
                    $rootScope.$on("loginStautsChange",function(){
                        console.log("receive event:loginStautsChange");
                        if (modalInstance)
                            modalInstance.close();
                    })
                    modalInstance.result.then(function() {
                        // isLoggingIn = true;
                        console.log("login resolved");
                    }, function(path) {
                        // isLoggingIn = false;
                        console.log("login rejected");
                         $location.path("/home");
                        //redirect to signup page

                    })['finally'](function() {
                        modalInstance = undefined;
                    });
                }
            }
        }
    ])
    ;
}());

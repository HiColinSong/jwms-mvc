/*bx - App.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    angular.module('bx')
    //set global 
    .run(["$rootScope","$locale","$location","utilSvc","dynamicLocale","bxService","modalLogin",
            function($rootScope,$locale,$location,utilSvc,dynamicLocale,apiSvc,modalLogin) {
              $locale.id="en-sg";
              dynamicLocale.setLocale($locale);
              //check login status
            //   apiSvc.checkLoginStatus();
              $rootScope.login=function(){
                  modalLogin.do();

              }
              $rootScope.logout=function(){
                  apiSvc.logout();
              }
              $rootScope.$on('$locationChangeSuccess', function(event){
                      var url = $location.url(),
                          params = $location.search();
                      console.log("locationChangeSuccess:"+url);
                      $rootScope.currentUrl=$location.url();
              })
            $rootScope.$on("$routeChangeStart", function(event, next, current) {
                  if (next.$$route&&next.$$route.bannedRoles){
                    if ($rootScope.authUser){
                        checkAuthorization(next,$rootScope.authUser,event);
                    } else {
                        apiSvc.checkLoginStatus().$promise.then(function(data){
                            if (data.loginUser){
                                checkAuthorization(next,data.loginUser,event);
                                $location.path(current.originalPath);
                            } else {
                                modalLogin.do();
                            }
                        },function(err){
                            modalLogin.do();
                            console.log(err);
                        });
                    }
                        
                }
            })

                function checkAuthorization(next,authUser,event){
                    for (let i = 0; i < next.$$route.bannedRoles.length; i++) {
                        const bannedRole = next.$$route.bannedRoles[i];
                        if (bannedRole===authUser.UserRole){
                            event.preventDefault();
                            utilSvc.addAlert("You are NOT authorized to access this module!", "fail", false);
                            break;
                        }
                    }
              }
    }])

   //  .run(['mockBackendService',function(mockSvc) {
  	// 	mockSvc.useMockBackend();
  	// }]);
}());


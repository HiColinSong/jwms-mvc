/*bx - App.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    angular.module('bx')
    //set global 
    .run(["$rootScope","$locale","$location","utilSvc","dynamicLocale","bxService","modalLogin",
            function($rootScope,$locale,$location,utilSvc,dynamicLocale,apiSvc,modalLogin) {
              $locale.id="en-sg";
              dynamicLocale.setLocale($locale);
              $rootScope.debug=$location.search().debug;
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
                  if (next.$$route&&next.$$route.bannedRoles&&$rootScope.authUser){
                      for (let i = 0; i < next.$$route.bannedRoles.length; i++) {
                          const bannedRole = next.$$route.bannedRoles[i];
                          if (bannedRole===$rootScope.authUser.UserRole){
                              event.preventDefault();
                              utilSvc.addAlert("You are NOT authorized to access this module!", "fail", false);
                              break;
                          }
                      }
                }
            })
    }])

   //  .run(['mockBackendService',function(mockSvc) {
  	// 	mockSvc.useMockBackend();
  	// }]);
}());


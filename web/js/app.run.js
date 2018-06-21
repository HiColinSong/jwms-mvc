/*bx - App.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    angular.module('bx')
    //set global 
    .run(["$rootScope","$locale","$location","$timeout","$route","dynamicLocale","bxService","modalLogin",
            function($rootScope,$locale,$location,$timeout,$route,dynamicLocale,apiSvc,modalLogin) {
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
                  var b = next;
                //   event.preventDefault();
              })
            //   $rootScope.$on('$locationChangeStart','$route', [function($route){

            //   }])
    }])

   //  .run(['mockBackendService',function(mockSvc) {
  	// 	mockSvc.useMockBackend();
  	// }]);
}());


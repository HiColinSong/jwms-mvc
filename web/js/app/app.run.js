/*bx - App.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    angular.module('bx')
    //set global 
    .run(["$rootScope","$window","$locale","$location","utilSvc","dynamicLocale","bxService","modalLogin",
            function($rootScope,$window,$locale,$location,utilSvc,dynamicLocale,apiSvc,modalLogin) {
              $locale.id="zh-cn";
              dynamicLocale.setLocale($locale);
              $rootScope.debug=$location.search().debug;
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
    }])
}());



/*bx - App.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    angular.module('bx')
   .config(['localStorageServiceProvider', function(localStorageServiceProvider){
            localStorageServiceProvider.setPrefix('doctorcard');
          // localStorageServiceProvider.setStorageCookieDomain('example.com');
            // localStorageServiceProvider.setStorageType('localStorage');
            localStorageServiceProvider.setPrefix('bx');
            localStorageServiceProvider.setStorageType('sessionStorage');
             localStorageServiceProvider.setNotify(true, true);
        }]);
}());


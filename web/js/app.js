/*bx - App.js - Yadong Zhu 2018*/
(function(angular) {
    'use strict';
    // Declare app level module which depends on filters, and services
   
    // angular.module('bx.mockBackend', ['ngMockE2E']);

    angular.module('bx.services', ['ngResource']);
    angular.module('bx.filters', []);
    angular.module('bx.directives', []);
    angular.module('bx.controllers', []);      
    angular.module('bx', [
        'ngRoute',
        'ngResource',
        'ngAnimate',
        'ngSanitize',
        'bx.controllers',
        'bx.services',
        'bx.filters',
        'bx.directives',
        'LocalStorageModule',
        // 'smart-table',
        'ui.bootstrap',
        'ui.toggle',
        // 'bx.mockBackend'
        'cfp.hotkeys'
    ]);
 
}(window.angular));


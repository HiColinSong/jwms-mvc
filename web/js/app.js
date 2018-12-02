/*bx - App.js - Yadong Zhu 2018*/
(function(angular) {
    'use strict';
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
        'ui.bootstrap',
        'ui.toggle'
    ]);
}(window.angular));


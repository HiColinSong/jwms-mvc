/*bx - filters.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Filters */
    angular.module('bx.filters')
    .filter('dispCategoryName', ['utilSvc','constants', function(utilSvc,constants,id) {
	    return function(id) {
	    	if (id)
	      		return utilSvc.findItemById(id,constants.categories,"id")["display"];
	    };
	  }]);
 }())
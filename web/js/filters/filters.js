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
		}])
		//take the date format "yyyyMMdd"
    .filter('ymdDate', ['$filter', function($filter) {
	    return function(dateString,format) {
	    	if (dateString)
	      		return $filter("date")(dateString+"T00:00:00",format);
	    };
		}])
		
		.filter('unique', function () {

		return function (items, filterOn) {
	  
		  if (filterOn === false) {
			return items;
		  }
	  
		  if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
			var hashCheck = {}, newItems = [];
	  
			var extractValueToCompare = function (item) {
			  if (angular.isObject(item) && angular.isString(filterOn)) {
				return item[filterOn];
			  } else {
				return item;
			  }
			};
	  
			angular.forEach(items, function (item) {
			  var valueToCheck, isDuplicate = false;
	  
			  for (var i = 0; i < newItems.length; i++) {
				if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
				  isDuplicate = true;
				  break;
				}
			  }
			  if (!isDuplicate) {
				newItems.push(item);
			  }
	  
			});
			items = newItems;
		  }
		  return items;
		};
	  });
 }())
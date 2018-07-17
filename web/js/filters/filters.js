/*bx - filters.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Filters */
    angular.module('bx.filters')
    .filter('displayBatch', [function(fullBarcode) {
			return function(fullBarcode){
				let barcode = new Barcode();
				barcode.barcode1=fullBarcode;
				barcode.parseBarcode()
				return barcode.batchNo;
			}
		}])
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
		//convert UTC datetime string to local datetime string
    .filter('localDatetime', ['$filter', function($filter) {
	    return function(dateString,format) {
	    	if (dateString){
					Number.prototype.padLeft = function(base,chr){
						var  len = (String(base || 10).length - String(this).length)+1;
						return len > 0? new Array(len).join(chr || '0')+this : this;
				}
					let d = new Date(dateString),
					dformat = [d.getFullYear(),
            (d.getMonth()+1).padLeft(),
            d.getDate().padLeft(),
            ].join('-') +' ' +
           [d.getHours().padLeft(),
            d.getMinutes().padLeft(),
            d.getSeconds().padLeft()].join(':');
            return dformat;
				}
	      		return dateString;
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
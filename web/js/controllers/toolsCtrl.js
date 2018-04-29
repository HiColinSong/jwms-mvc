/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('toolsCtrl',['$scope', '$location','$routeParams',
    	function($scope,$location,$routeParams){
    		$scope.toolType=$routeParams.toolType;
    		if ($routeParams.toolType){
	    		$scope.info={type:$routeParams.toolType};
	    		switch ($routeParams.toolType){
	    			case "picking-reversals":
	    				$scope.info.title="Picking Reversals";
	    				$scope.info.order="TO";
	    				break;
	    			case "packing-reversals":
	    				$scope.info.title="Packing Reversals";
	    				$scope.info.order="DO";
	    				break;
	    			case "reservation":
	    				$scope.info.title="Reservation";
	    				$scope.info.order="TO";
	    				break;
	    			case "pgi":
	    				$scope.info.title="PGI";
	    				$scope.info.order="DO";
	    				break;
	    			case "reversals-pgi":
	    				$scope.info.title="PGI Reversals";
	    				$scope.info.order="DO";
	    				break;
	    		}
    		}

	    	$scope.gotoTool=function(toolType){
	    		$location.path("/tools/"+toolType);
	    	}
    }])
 }())

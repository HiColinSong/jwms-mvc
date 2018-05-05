/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('toolsCtrl',['$scope', '$location','$routeParams','bxService','modalConfirmSubmit','utilSvc',
    	function($scope,$location,$routeParams,apiSvc,confirmSubmit,utilSvc){
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
			$scope.submitForm=function(){
				var orderNo = utilSvc.formalizeOrderNo($scope.info.orderNo);
				
				switch ($scope.info.type){
	    			case "picking-reversals":
						break;
					case "packing-reversals":
						apiSvc.reverseOperation({type:'packing',param1:orderNo}).$promise.then(resultHandler,errorHandler);
						break;
					case "reservation":
						break;
					case "pgi":
						apiSvc.pgiUpdate({orderNo:orderNo,currentDate:utilSvc.formatDate()}).$promise.then(resultHandler,errorHandler);
						break;
	    			case "reversals-pgi":
						apiSvc.pgiReversal({orderNo:orderNo,currentDate:utilSvc.formatDate()}).$promise.then(resultHandler,errorHandler);
	    				break;
				}		
					
			}
			const resultHandler = function(data){
				if (data&&data.confirm==='success'){
					$scope.confirm={
						type:"success",
						modalHeader: 'Operation Success',
						message:"The operation is confirmed successfully!",
					}
				} else if(data&&data.error&&data.message){
					$scope.confirm={
						type:"danger",
						modalHeader: 'Operation Fail',
						message:data.message,
					}
				} else if(data&&data.confirm==='fail'){
					$scope.confirm={
						type:"damger",
						modalHeader: 'Operation Fail',
						message:"The operaton is failed!",
					}
				} else {
					$scope.confirm={
						type:"danger",
						modalHeader: 'Operation Fail',
						message:"Unknown error, confirmation is failed!",
					}
				}
				confirmSubmit.do($scope);
			}
			const errorHandler=function(err){
				console.error(err);
				$scope.confirm={
					type:"danger",
					modalHeader: 'Operation Fail',
					message:"System error, Operation is failed!",
				}
				confirmSubmit.do($scope);
			}
    }])
 }())

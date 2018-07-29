/*bx - Controllers.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Controllers */
    angular.module('bx.controllers')
    .controller('qrsmtPrepackCtrl', ['$scope', '$controller', 'order','utilSvc','bxService',
        function ($scope, $controller,order,util,apiSvc){
        $controller('packingCtrl', {$scope: $scope,order:order})
        $scope.type="qrsmt"
        // $scope.refreshScannedItems=function(){
        //     util.pageLoading("start");
        //     apiSvc.refreshScannedItems({type:$scope.type},{orderNo:$scope.orderNo}).$promise.
        //         then(function(data){
        //             util.pageLoading("stop");
        //             if (data&&data.length>0&&data[0].error)
        //                 console.error(data[0].message.originalError.info.message);
        //             else 
        //                 $scope.items=$scope.order.scannedItems = data;
        //         },function(error){
        //             console.error(error);
        //             util.pageLoading("stop");
        //         }
        //     )
        // }
    }])
 }())

/*bx - directives.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Directives */
    angular.module('bx.directives')
    .directive('spoReceiveList', ['bxService','utilSvc',
            function(apiSvc,utilSvc) {
                return {
                    restrict: 'A',
                    templateUrl: 'partials/spo-received-list.html',
                    scope: {
                        target:"@",
                        subconNo:"@"
                    },
                    link: function(scope, elem, attrs) {
                        if (scope.target==='SGW'){
                            scope.buttonText = "Refresh BIT Scan List";
                        } else if (scope.target==='SGQ'){
                            scope.buttonText = "Refresh QA Sample Scan List";
                        } else if (scope.target==='QRS'){
                            scope.buttonText = "Refresh Quarantine Shipment Scan List";
                        }

                        scope.refreshItemList=function(ShipToTarget){
                            utilSvc.pageLoading("start");
                            apiSvc.getSubconReceiveList({subconPO:scope.subconNo,ShipToTarget:ShipToTarget})
                                .$promise.then(function(data){
                                    if (data){
                                        scope.itemList = data.receiveList;
                                        // if (ShipToTarget==='SGW'){
                                        //     scope.bitList = data.receiveList;
                                        // } else if (ShipToTarget==='SGQ'){
                                        //     scope.qasList = data.receiveList;
                                        // } else {
                                        //     scope.quarShptList = data.receiveList;
                                        // }
                                    }
                                    utilSvc.pageLoading("stop");
                                },function(err){
                                    if (err.data&&err.data.message){
                                        utilSvc.addAlert(err.data.message, "fail", true);
                                    }
                                    utilSvc.pageLoading("stop");
                                })
                        }
                       
                    }
                };
            }
        ]);
 }())
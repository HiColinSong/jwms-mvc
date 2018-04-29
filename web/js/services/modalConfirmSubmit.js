/*bx - services.js - Yadong Zhu 2017*/ (function() {
    'use strict';
    angular.module('bx.services')
    .service('modalConfirmSubmit',['$http', '$modal','$location','$rootScope',
        function($http, $modal,$location,$rootScope) {
            return {
                do:function($scope){
                    var modalInstance = $modal.open({
                        templateUrl: 'partials/confirm-submit-modal.html',
                        scope:$scope
                    });
                    $scope.yes = function() {
                        modalInstance.close("yes");
                    }
                    modalInstance.result.then(function() {
                        $location.path($scope.confirm.resetPath);
                    }, function(path) {
                        console.log($scope.confirm.message);
                    })['finally'](function() {
                        modalInstance = undefined;
                    });
                }
            }
        }
    ])
    ;
}());

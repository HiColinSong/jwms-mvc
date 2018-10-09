/**
 * Directive to instantly enable/disable multiple checkboxes based on a master checkbox.
 * Changing slave checkboxes will update the master checkbox accordingly, including the indeterminate state.
 *
 * Usage example:
 *
 * <label><input type="checkbox" select-all="theProperties"> Select all</label>
 * <div ng-repeat="property in properties">
 *   <label><input type="checkbox" rel="theProperties" ng-model="property.checked"> {{ property.label }}</label>
 * </div>
 *
 * Note that the 'rel' attribute on slave checkboxes should match the 'select-all' attribute.
 */
/*bx - directives.js - Yadong Zhu 2018*/
(function() {
    'use strict';
    /* Directives */
    angular.module('bx.directives')
    .directive('selectAllCheckbox', function () {
        return {
            replace: true,
            restrict: 'E',
            scope: {
                checkboxes: '=',
                property:'@',
                allselected: '=allSelected',
                allclear: '=allClear'
            },
            template: '<input type="checkbox" ng-model="master" ng-change="masterChange()" style="height:14px;width:20px;margin-top:0" title="Select/Unselect All">',
            controller: function ($scope, $element) {
                let property=$scope.property;
                $scope.masterChange = function () {
                    if ($scope.master) {
                        angular.forEach($scope.checkboxes, function (cb, index) {
                            cb[property] = true;
                        });
                    } else {
                        angular.forEach($scope.checkboxes, function (cb, index) {
                            cb[property] = false;
                        });
                    }
                };
    
                $scope.$watch('checkboxes', function () {
                    var allSet = true,
                        allClear = true;
                    angular.forEach($scope.checkboxes, function (cb, index) {
                        if (cb[property]) {
                            allClear = false;
                        } else {
                            allSet = false;
                        }
                    });
    
                    if ($scope.allselected !== undefined) {
                        $scope.allselected = allSet;
                    }
                    if ($scope.allclear !== undefined) {
                        $scope.allclear = allClear;
                    }
    
                    $element.prop('indeterminate', false);
                    if (allSet) {
                        $scope.master = true;
                    } else if (allClear) {
                        $scope.master = false;
                    } else {
                        $scope.master = false;
                        $element.prop('indeterminate', true);
                    }
    
                }, true);
            }
        };
    });
}());
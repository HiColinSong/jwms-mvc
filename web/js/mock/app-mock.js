/*bx - App.js - Yadong Zhu 2015*/
(function(angular) {
	'use strict';


	angular.module('bx.mockBackend', ['ngMockE2E']);

	angular.module('bxMock', [
		'bx',
		'bx.mockBackend'
	])
	.run(['mockBackendService',function(mockSvc) {
		mockSvc.useMockBackend();
	}])

}(window.angular));
/*jshint strict:true, browser:true*/
/*global angular:true*/

// https://material.angularjs.org
// Include app dependency on ngMaterial
angular.module( 'YourApp', [ 'ngMaterial' ] )
	.controller("YourController", ['$scope', function ($scope) {
		'use strict';
		$scope.ohYeah = 'ohYeah! Angular Material ready! Good, good, good!';
	}] );
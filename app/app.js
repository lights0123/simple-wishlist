'use strict';

// Declare app level module which depends on views, and components
angular.module('simple-wishlist', [
	'simple-wishlist.listView'
]).config(['$routeProvider', function ($routeProvider) {
	$routeProvider.otherwise({redirectTo: '/listView'});
}]).run(function ($templateCache, $http) {
	$http.get('listView/edit.html', { cache: $templateCache });
});
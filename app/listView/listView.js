'use strict';

angular.module('simple-wishlist.listView', ['ngRoute', 'ng-sortable', 'ui.bootstrap'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/listView/:list?', {
			templateUrl: 'listView/listView.html',
			controller: 'listViewCtrl'
		});
	}])

	.controller('listViewCtrl', ["$scope", "$routeParams", "$uibModal", function ($scope, $routeParams, $uibModal) {
			$scope.todoLists = {
				Untitled: [

				]
			};
			function importFromStorage(){
				$scope.todoLists = JSON.parse(window.localStorage.data);
				$scope.todoLists = normalizeLists($scope.todoLists);
			}
			try{
				importFromStorage()
			}catch(e){}
			function saveToStorage(){
				window.localStorage.data = JSON.stringify($scope.todoLists);
			}
			$scope.todoLists = normalizeLists($scope.todoLists);
			$scope.hidePopups = function () {
				$scope.todoLists[$scope.selectedList].forEach(function (data) {
					data.popupShown = false;
				});
			};
			$scope.import = function () {
				var inp = prompt("Please Paste your Sharing String");
				try{
					var data = JSON.parse(inp);
					$scope.todoLists[$scope.selectedList] = data;
					$scope.todoLists = normalizeLists($scope.todoLists);
				}catch(e){
					alert("Error parsing data");
					console.log(e);
				}
				saveToStorage();
			};
			$scope.selectedList = $routeParams.list;
			if (angular.equals($scope.todoLists, {})) {
				$scope.todoLists = {
					Untitled: []
				};
			}
			if (Object.keys($scope.todoLists).indexOf($scope.selectedList) === -1) {
				$scope.selectedList = Object.keys($scope.todoLists)[0];
			}
			$scope.sortableOptions = {
				animation: 150,
				handle: ".hamburger"
			};
			$scope.add = function (type) {
				if (type === "item") {
					$scope.todoLists[$scope.selectedList].push({
						name: "",
						buyat: [],
						popupShown: true
					});
				} else {
					$scope.todoLists[$scope.selectedList].push({
						name: "",
						type: 'section',
						popupShown: true
					});
				}
			};
			$scope.log = console.log;
		}]
	).controller('editCtrl', ['$scope', function ($scope) {
	$scope.copy = angular.copy($scope.$parent.$parent.item);
	$scope.ok = function () {
		$scope.copy.popupShown = false;
		$scope.$parent.$parent.item = normalizeList($scope.copy);
		saveToStorage();
	};
	$scope.cancel = function () {
		$scope.$parent.$parent.item.popupShown = false;
	};
	$scope.delete = function () {
		var root = $scope.$parent.$parent.$parent;
		root.todoLists[root.selectedList].splice([$scope.$parent.$parent.$index], 1);
		saveToStorage();
	};
	$scope.deletePlace = function ($index) {
		$scope.copy.buyat.splice($index, 1);
	};
	$scope.addBuyat = function () {
		$scope.copy.buyat.push({});
	}
}]);
function normalizeLists(data) {
	var copy = {};
	if (typeof data !== 'object' || angular.equals(data, {})) return {Untitled: []};
	Object.keys(data).forEach(function (listName) {
		copy[listName] = [];
		data[listName].forEach(function (list) {
			copy[listName].push(normalizeList(list));
		})
	});
	return copy;
}
function normalizeList(data) {
	var copy = {name: "Untitled", buyat: []};
	if (typeof data !== 'object') return copy;
	copy.name = typeof data.name === 'string' ? data.name : "Untitled";
	if (data.type === "section") {
		delete copy.buyat;
		copy.type = "section";
		return copy;
	}
	if (!Array.isArray(data.buyat)) return copy;
	if (typeof data.priority === 'string'
		&& (data.priority = data.priority.toLowerCase())
		&& ['low', 'medium', 'high'].indexOf(data.priority) !== -1) {
		copy.priority = data.priority;
	}
	data.buyat.forEach(function (place) {
		var nPlace = {name: "Untitled", price: "$0.00", link: ""};
		nPlace.name = typeof place.name === 'string' && place.name !== "" ? place.name : "Untitled";
		nPlace.link = typeof place.link === 'string' ? place.link : "";
		switch (typeof place.price) {
			case 'number':
				var round = place.price.toFixed(2);
				if (round !== "NaN") nPlace.price = '$' + round;
				break;
			case 'string':
				var match = /\$?(\d*(?:\.\d{1,2})?)/.exec(place.price);
				if (match !== null) {
					var res = parseFloat(match[1]);
					if (!isNaN(res)) nPlace.price = '$' + res.toFixed(2);
				}
				break;
		}
		if (!angular.equals(nPlace, {name: "Untitled", price: "$0.00", link: ""})) copy.buyat.push(nPlace);
	});
	return copy;
}
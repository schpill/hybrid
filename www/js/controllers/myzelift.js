(function () {
    'use strict';

    angular.module('zelift').controller('myzelift', myzeliftController);

    function myzeliftController($ionicPopup, $ionicPlatform, $http, $rootScope, $window, $scope, $filter, $state, utils, store, $stateParams, $timeout, $log, global) {
        global.setScope($scope);
        $scope.viewTitle = 'Mes commerçants';
    }

})();

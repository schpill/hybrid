(function () {
    'use strict';

    angular.module('zelift').controller('about', aboutController);

    function aboutController($ionicPopup, $ionicPlatform, $http, $rootScope, $window, $scope, $filter, $state, utils, store, $stateParams, $timeout, $log) {
        $scope.viewTitle = 'Mon compte';
    }

})();

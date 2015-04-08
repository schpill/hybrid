(function () {
    'use strict';

    angular.module('zelift').controller('settings', settingsController);

    function settingsController($ionicPopup, $ionicPlatform, $http, $rootScope, $window, $scope, $filter, $state, utils, store, $stateParams, $timeout, $log, global) {
        global.setScope($scope);
        $scope.viewTitle = 'Mes paramètres';
    }

})();

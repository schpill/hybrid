(function () {
    'use strict';

    angular.module('zelift').controller('account', accountController);

    function accountController($ionicPopup, $ionicPlatform, $http, $rootScope, $window, $scope, $filter, $state, utils, store, $stateParams, $timeout, $log) {
        $scope.viewTitle = 'Mon compte';
    }

})();

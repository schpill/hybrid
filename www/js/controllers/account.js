(function () {
    'use strict';

    angular.module('zelift').controller('account', accountController);

    function accountController($ionicPopup, $ionicPlatform, $http, $rootScope, $window, $scope, $filter, $state, utils, store, $stateParams, $timeout, $log, global) {
        global.setScope($scope);
        $scope.viewTitle = 'Mon compte';
    }

})();

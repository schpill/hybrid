(function () {
    'use strict';

    angular.module('zelift').controller('home', homeController);

    function homeController($rootScope, $window, $scope, $filter, $state, utils, store, $stateParams, global, memo) {
        global.setScope($scope);

        $scope.store().del('lastquery');

        $scope.viewTitle = 'Accueil';
    }

})();

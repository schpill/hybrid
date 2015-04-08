(function () {
    'use strict';

    angular.module('zelift').controller('home', homeController);

    function homeController($window, $scope, $filter, $state, utils, store, $stateParams, global) {
        global.setScope($scope);
        $scope.viewTitle = 'Accueil';
    }

})();

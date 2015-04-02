(function () {
    'use strict';

    angular.module('zelift').controller('home', homeController);

    function homeController($window, $scope, $filter, $state, utils, store, $stateParams) {
        $scope.viewTitle = 'Accueil';
    }

})();

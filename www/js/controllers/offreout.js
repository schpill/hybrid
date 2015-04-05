(function () {
    'use strict';

    angular.module('zelift').controller('offreout', offreoutController);

    function offreoutController($ionicPlatform, $ionicModal, $ionicPopup, $http, $rootScope, $window, $scope, $filter, $state, utils, store, $stateParams, $timeout, $log, $cordovaDatePicker) {
        $ionicPlatform.ready(function () {
            $scope.getRemember('offresout.services', function (datas) {
                $scope.offersData = datas;
            });
        });

        $scope.hour = function (hms) {
            var tab = hms.split('à ');

            return tab[1].split(':').join('h');
        };

        $scope.duration = function (hms) {
            var tab = hms.split(':');
            var min = tab[1];

            min = ('00' == min) ? '' : min;

            return tab[0] + 'h' + min;
        };
    }
})();

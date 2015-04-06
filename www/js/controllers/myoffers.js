(function () {
    'use strict';

    angular.module('zelift').controller('myoffers', myOffersController);

    function myOffersController($ionicPlatform, $ionicModal, $ionicPopup, $http, $rootScope, $window, $scope, $filter, $state, utils, store, $stateParams, $timeout, $log, $cordovaDatePicker) {

        $scope.wsData = {
            'account_id' : $scope.user.id,
            'token' : $scope.user.token
        };

        $ionicPlatform.ready(function () {
            $scope.viewTitle = 'Mes commandes';

            $http.post($rootScope.apiUrl + 'myoffers', $scope.wsData)
            .success(function(data) {
                switch (data.status) {
                    case 200:
                        $timeout(function() {
                            $scope.myoffersin = data.results;
                        }, 300);

                        break;
                    case 500:
                        $ionicPopup.alert({
                            title: '<i class="fa fa-exclamation-triangle fa-3x zeliftColor"><i>',
                            template: data.message,
                            buttons: [{
                                text: 'OK',
                                type: 'button button-full button-zelift'
                            }]
                        });

                        break;
                }
            })
            .error(function (data, status) {
                $log.log($rootScope.apiUrl + 'children');
                $log.log(status);
            });
        });
    }
})();

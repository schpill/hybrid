(function () {
    'use strict';

    angular.module('zelift').controller('services', servicesController);

    function servicesController($ionicPopup, $http, $rootScope, $window, $scope, $filter, $state, utils, store, $stateParams, $timeout, $log, global) {
        global.setScope($scope);
        $scope.viewTitle = 'Les services';

        $scope.getItemUrl = function (item) {
            return item.is_item != 1 ? '#/zelift/children/' + item.id : '#/zelift/offrein/' + item.id;
        };

        $scope.servicesItems = [];

        function getMarkets()
        {
            var dataServices = {
                'id' : 0,
                'u' : 'services'
            };

            if ($scope.user.token) {
                dataServices.token = $scope.user.token;
            }

            $scope.remember('univers.services.detail', function () {
                $http.post($rootScope.apiUrl + 'market', dataServices)
                .success(function(data) {
                    switch (data.status) {
                        case 200:
                            $timeout(function() {
                                $scope.servicesItems = data.results;
                                $scope.addRemember('univers.services.detail', data.results);
                            }, 300);

                            break;
                        case 500:
                            if (data.message.match('ession invalide')) {
                                $scope.signOut();
                            } else {
                                $ionicPopup.alert({
                                    title: '<i class="fa fa-exclamation-triangle fa-3x zeliftColor"><i>',
                                    template: data.message,
                                    buttons: [{
                                        text: 'OK',
                                        type: 'button button-full button-zelift'
                                    }]
                                });
                            }

                            break;
                    }
                })
                .error(function (data, status) {
                    $log.log($rootScope.apiUrl + 'search');
                    $log.log(status);
                });
            }, function (res) {
                $timeout(function() {
                    $scope.servicesItems = res;
                }, 100);
            });
        }

        getMarkets();
    }

})();

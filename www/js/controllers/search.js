(function () {
    'use strict';

    angular.module('zelift').controller('search', searchController);

    function searchController($ionicPopup, $http, $rootScope, $window, $scope, $filter, $state, utils, store, $stateParams, $timeout, $log) {
        $scope.searchData = {};
        $scope.viewTitle = 'Rechercher un service';

        $scope.getItemsSearch = function() {
            var q = $scope.searchData.query;
            $scope.searchItems = [];

            if (q) {
                if (q.length >= 2) {
                    var dataSearch = {
                        'q' : q,
                        'token' : $scope.user.token,
                        'u' : 'services'
                    };

                    $http.post($rootScope.apiUrl + 'search', dataSearch)
                    .success(function(data) {
                        switch (data.status) {
                            case 200:
                                $timeout(function() {
                                    $scope.searchItems = data.results;
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
                        $log.log($rootScope.apiUrl + 'search');
                        $log.log(status);
                    });
                }
            }
        };

        $scope.getItemUrl = function (item) {
            return item.is_item != 1 ? '#/zelift/children/' + item.id : '#/zelift/offrein/' + item.id;
        };
    }

})();

(function () {
    'use strict';

    angular.module('zelift').controller('search', searchController);

    function searchController($ionicPopup, $http, $rootScope, $window, $scope, $filter, $state, utils, store, $stateParams, $timeout, $log, global, jdb, memo, sha1) {

        var store = memo.init();

        $scope.getItemsSearch = function() {
            var q = $scope.searchData.query;
            $scope.searchItems = [];

            if (q) {
                if (q.length >= 2) {
                    var keySearch = sha1.encode(q);
                    store.set('lastquery', q);

                    var cacheSearch = store.get('search.' + keySearch);

                    if (cacheSearch) {
                        console.log('search cache exists');
                        $scope.searchItems = cacheSearch;
                    } else {
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
                                        store.set('search.' + keySearch, data.results);
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

                            $ionicPopup.alert({
                                title: '<i class="fa fa-exclamation-triangle fa-3x zeliftColor"><i>',
                                template: 'Recherche indisponible hors réseau',
                                buttons: [{
                                    text: 'OK',
                                    type: 'button button-full button-zelift'
                                }]
                            });

                            $scope.go('zelift.home');
                        });
                    }
                }
            }
        };

        var db = jdb.init('core', 'search');

        global.setScope($scope);

        $scope.searchData = {
            'query': store.get('lastquery', '')
        };

        var q = $scope.searchData.query;

        if (q) {
            if (q.length >= 2) {
                $scope.getItemsSearch();
            }
        }

        $scope.viewTitle = 'Rechercher un service';

        $scope.getItemUrl = function (item) {
            return item.is_item != 1 ? '#/zelift/children/' + item.id : '#/zelift/offrein/' + item.id;
        };
    }

})();

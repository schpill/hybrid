(function () {
    'use strict';

    angular.module('zelift').controller('localize', localizeController);

    function localizeController($rootScope, $window, $scope, $filter, $state, utils, store, $stateParams, global, memo, $http) {
        global.setScope($scope);

        $scope.viewTitle = 'Localisation';

        $scope.searchData = {
            'query': ''
        };
        $scope.suggestItems = {};

        $scope.suggest = function () {
            if ($scope.searchData) {
                if ($scope.searchData.query) {
                    if ($scope.searchData.query.length > 0) {
                        var lat1 = 47.30260407443852;
                        var lng1 = 4.967421124828526;
                        var lat2 = 47.34480957347921;
                        var lng2 = 5.101023090992229;

                        var url = 'http://suggest.mappy.net/suggest/1.0/suggest?max=10&extend_bbox=1&bbox=' + lat1 + '%2C' + lng1 + '%2C' + lat2 + '%2C' + lng2 + '&q=' + $scope.searchData.query + '&f=all';

                        $http.get(url).success(function (data) {
                            $scope.suggestItems = data.suggests;

                            console.log(JSON.stringify(data.suggests));

                        }).error();
                    }
                }
            }
        };

        $scope.showAddress = function (address) {
            return address.split('<em>').join('').split('</em>').join('');
        };

        $scope.finalizeLoc = function (item) {
            $scope.searchData.query = $scope.showAddress(item.address);
            $scope.suggestItems = {};
            var lat1 = 47.30260407443852;
            var lng1 = 4.967421124828526;
            var lat2 = 47.34480957347921;
            var lng2 = 5.101023090992229;

            var url = 'http://search.mappy.net/search/1.0/find?extend_bbox=1&bbox=' + lat1 + '%2C' + lng1 + '%2C' + lat2 + '%2C' + lng2 + '&q=' + $scope.searchData.query + '&favorite_country=250&language=FRE&loc_format=geojson&max_results=100';

            $http.get(url).success(function (data) {
                if (data.addresses.features[0].geometry.geometries[0].coordinates) {
                    var coords = data.addresses.features[0].geometry.geometries[0].coordinates;

                    var lng = coords[0];
                    var lat = coords[1];

                    $scope.position         = {'lng': lng, 'lat': lat};
                    $scope.user.latitude    = lat;
                    $scope.user.longitude   = lng;
                    $scope.user.lat = lat;
                    $scope.user.lng = lng;

                    localStorage.setItem('latitude', $scope.user.lat);
                    localStorage.setItem('longitude', $scope.user.lng);
                    localStorage.setItem('coords.age', global.now());
                    localStorage.setItem('coords.age', global.now());
                    $scope.isMapped = true;

                    console.log('geo address [lng = ' + $scope.user.lng + ',  lat = ' + $scope.user.lat + ']');
                    $scope.isDev = false;

                    $scope.go('zelift.home');
                }
            }).error();
        };
    }

})();

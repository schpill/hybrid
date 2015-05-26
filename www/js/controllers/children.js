(function () {
    'use strict';

    angular.module('zelift').controller('children', childrenController);

    function childrenController($ionicPopup, $ionicPlatform, $http, $rootScope, $window, $scope, $filter, $state, utils, store, $stateParams, $timeout, $log, global, memo) {
        global.setScope($scope);

        $scope.getItemUrl = function (item) {
            return item.is_item != 1 ? '#/zelift/children/' + item.id : '#/zelift/offrein/' + item.id;
        };

        var store = memo.init();

        var childrenId = $stateParams.childrenId;

        $scope.childrenItems = [];

        function getChildrenMarkets()
        {
            var cache = store.get('children.memo.' + childrenId);
            var cacheTitle = store.get('title.' + childrenId);

            if (cache && cacheTitle) {
                $scope.childrenItems = cache;
                $scope.viewTitle = cacheTitle;
            } else {
                var dataChildren = {
                    'id' : childrenId,
                    'u' : 'services'
                };

                if ($scope.user.token) {
                    dataChildren.token = $scope.user.token;
                }

                $scope.remember('children.memo.' + childrenId, function () {
                    $http.post($rootScope.apiUrl + 'market', dataChildren)
                    .success(function(data) {
                        switch (data.status) {
                            case 200:
                                $timeout(function() {
                                    $scope.findDb('segment', childrenId, function (res) {
                                        $scope.viewTitle = res.name;
                                        store.set('title.' + childrenId, res.name);
                                    });

                                    $scope.childrenItems = data.results;
                                    $scope.addRemember('children.memo.' + childrenId, data.results);
                                    store.set('children.memo.' + childrenId, data.results);
                                }, 300);

                                break;
                            case 500:
                                if (data.message.match('ession invalide')) {
                                    $scope.signOut();
                                } else {
                                    $ionicPopup.alert({
                                        title: '<i class="fa fa-exclamation-triangle fa-3x zeliftColor"><i>',
                                        template: data.message + ' !',
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
                        $log.log($rootScope.apiUrl + 'children');
                        $log.log(status);
                    });
                }, function (res) {
                    $timeout(function() {
                        $scope.findDb('segment', childrenId, function (r) {
                            $scope.viewTitle = r.name;
                            store.set('title.' + childrenId, r.name);
                        });

                        $scope.childrenItems = res;
                        store.set('children.memo.' + childrenId, res);
                    }, 100);
                });
            }
        }

        $ionicPlatform.ready(function () {
            getChildrenMarkets();
        });
    }

})();

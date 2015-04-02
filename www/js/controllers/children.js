(function () {
    'use strict';

    angular.module('zelift').controller('children', childrenController);

    function childrenController($http, $rootScope, $window, $scope, $filter, $state, utils, store, $stateParams, $timeout, $log) {
        $scope.getItemUrl = function (item) {
            return item.is_item != 1 ? '#/zelift/children/' + item.id : '#/zelift/offrein/' + item.id;
        };

        var childrenId = $stateParams.childrenId;

        $scope.childrenItems = [];

        function getChildrenMarkets()
        {
            var dataChildren = {
                'token' : $scope.user.token,
                'id' : childrenId,
                'u' : 'services'
            };

            $http.post($rootScope.apiUrl + 'market', dataChildren)
            .success(function(data) {
                switch (data.status) {
                    case 200:
                        $timeout(function() {
                            $scope.findDb('segment', childrenId, function (res) {
                                $scope.viewTitle = res.name;
                            });

                            $scope.childrenItems = data.results;
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
        }

        getChildrenMarkets();
    }

})();

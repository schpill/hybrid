(function () {
    'use strict';

    angular.module('zelift').controller('offrein', offreinController);

    function offreinController($http, $rootScope, $window, $scope, $filter, $state, utils, store, $stateParams, $timeout, $log, $cordovaDatePicker) {
        $scope.getItemUrl = function (item) {
            return item.is_item != 1 ? '#/zelift/children/' + item.id : '#/zelift/offrein/' + item.id;
        };

        var segmentId = $stateParams.segmentId;

        function init()
        {
            $scope.dataOffreinform = {
                'langue' : 'non'
            };

            var dataOffreIn = {
                'token' : $scope.user.token,
                'id' : segmentId
            };

            $http.post($rootScope.apiUrl + 'offreinform', dataOffreIn)
            .success(function(data) {
                switch (data.status) {
                    case 200:
                        $timeout(function() {
                            $scope.viewTitle = data.results.title;
                            $scope.offreinform = data.results.form;

                            $scope.showQuantity = data.results.form.quantity.label.length > 0;

                            if (data.results.form.is_calendar === true) {
                                // $scope.dataOffreinform.date = data.results.form.min_date_default;
                                // console.log($scope.dataOffreinform.date);
                            }

                            if (data.results.form.quantity.type == 'min_max') {
                                $scope.dataOffreinform.quantity = data.results.form.quantity.min;
                            }

                            if (data.results.form.quantity.type == 'int') {
                                $scope.dataOffreinform.quantity = parseInt(data.results.form.quantity.default);
                            }
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

        init();
    }

})();

(function () {
    'use strict';

    /**
     * Define the main application module.
     */
    angular
        .module('zelift', ['ionic', 'ngCordova'])
        .run(function ($ionicPlatform, $ionicLoading, $rootScope, $http) {
            $ionicPlatform.ready(function () {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs).
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }

                if (window.StatusBar) {
                    StatusBar.styleDefault();
                }
            });

            $rootScope.ENV = 'development';

            $rootScope.conf = function () {
                this.get = function (key, cb, defaultVal) {
                    defaultVal = typeof(defaultVal) == 'undefined' ? null : defaultVal;

                    $http.get('js/data/config.json')
                    .success(function(res) {
                        var seg = res[$rootScope.ENV];
                        var tab = key.split('.');

                        for (var i = 0; i < tab.length; i++) {
                            seg = seg[tab[i]];
                        }

                        cb(seg);
                    });
                };

                return this;
            };

            $rootScope.conf().get('api.url', function (res) {
                $rootScope.apiUrl = res;
            });

            //*** Show loading indicator between page transitions - mostly for when deployed
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                $ionicLoading.show({
                    template: '<i class="icon ion-loading-b"></i>'
                });
            });

            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                $ionicLoading.hide();
            });

            $rootScope.$on('$stateNotFound', function(ev, unfoundState, fromState) {
                console.log("stateNotFound:");
                console.log(unfoundState);
                console.log(fromState);
            });
        })

        .directive('toggleClass', ['$window', function(classe) {
            return {
                restrict: 'A',

                link: function(scope, element, attr) {
                    if (scope.isMenuLeftOpened === false) {
                        console.log('fd');
                    }
                }
            };
        }])

        .config(['$httpProvider', function ($httpProvider) {
            $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        }])
})();

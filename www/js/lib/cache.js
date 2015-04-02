(function () {
    'use strict';

    angular.module('zelift').factory('cache', function ($q, $ionicPlatform, $cordovaSQLite) {
        var self = this;

        if (window.cordova) {
            $ionicPlatform.ready(function () {
                self.init = function () {
                    console.log('cache OK');
                };
            });
        }

        return self;
    });
})();

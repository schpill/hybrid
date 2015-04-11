(function () {
    'use strict';

    var globalData = {};

    angular.module('zelift').factory('memo', function () {
        var self = this;

        if (!globalData['core']) {
            globalData['core'] = {};
        }

        self.data = globalData['core'];

        self.init = function (instance) {
            if (typeof(instance) == 'undefined') {
                instance = 'core';
            }

            if (!globalData[instance]) {
                globalData[instance] = {};
            }

            self.data = globalData[instance];

            return self;
        };

        self.get = function (key, defaultVal) {
            console.log('memo get ' + key);

            if (typeof(defaultVal) == 'undefined') {
                defaultVal = null;
            }

            if (!self.data[key]) {
                return defaultVal;
            }

            return self.data[key];
        };

        self.set = function (key, val) {
            console.log('memo set ' + key);
            self.data[key] = val;

            return self;
        };

        self.has = function (key) {
            console.log('memo has ' + key);

            return self.get(key, '123dummy') != '123dummy';
        };

        self.del = function (key) {
            if (self.data[key]) {
                console.log('memo del ' + key);
                delete self.data[key];

                return true;
            } else {
                return false;
            }
        };

        self.delPattern = function(pattern) {
            for (var i = 0; i < self.data.length; i++) {
               var name = self.data.key(i);

                if (name.match(pattern)) {
                    console.log('memo delPattern ' + name);
                    delete self.data[name];
                }
            }
        };

        return self;
    });
})();

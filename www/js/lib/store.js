(function () {
	'use strict';

	angular.module('zelift').factory('store', Store);

	function Store($http, $window) {
		var lib = {
            set: set,
            get: get,
            del: del,
            setObject: setObject,
            getObject: getObject
		};

		return lib;

        function set(key, value) {
            $window.localStorage[key] = value;
        }

        function get(key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        }

        function del(key) {
            return delete $window.localStorage[key];
        }

        function setObject(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        }

        function getObject(key) {
            return JSON.parse($window.localStorage[key] || '{}');
        }
	}
})();

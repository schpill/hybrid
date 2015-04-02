'use strict';

angular.module('zelift-config', [])

.constant('ENV', {
   'development': {
        apiEndpoint: 'https://192.168.1.22/zelift/api/'
    }
})

;

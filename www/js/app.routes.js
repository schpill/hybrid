(function() {
    'use strict';

	angular
		.module('zelift')
		.config(function ($stateProvider, $urlRouterProvider) {
            //** abstract route for sidemenu
            $stateProvider.state('zelift', {
                url: '/zelift',
                abstract: true,
                templateUrl: 'templates/sidemenu.html',
                controller: 'sidemenu'
            });

            //**  home
            $stateProvider.state('zelift.home', {
                url: '/home',
                cache: false,
                views: {
                    'main': {
                        templateUrl: 'templates/home.html',
                        controller: 'home'
                    }
                }
            });

            //**  search
            $stateProvider.state('zelift.search', {
                url: '/search',
                cache: false,
                views: {
                    'main': {
                        templateUrl: 'templates/search.html',
                        controller: 'search'
                    }
                }
            });

            //**  services
            $stateProvider.state('zelift.services', {
                url: '/services',
                cache: false,
                views: {
                    'main': {
                        templateUrl: 'templates/services.html',
                        controller: 'services'
                    }
                }
            });

            //**  children
            $stateProvider.state('zelift.children', {
                url: '/children/:childrenId',
                cache: false,
                views: {
                    'main': {
                        templateUrl: 'templates/children.html',
                        controller: 'children'
                    }
                }
            });

            //**  offrein
            $stateProvider.state('zelift.offrein', {
                url: '/offrein/:segmentId',
                cache: false,
                views: {
                    'main': {
                        templateUrl: 'templates/offrein.html',
                        controller: 'offrein'
                    }
                }
            });

            //**  map
            $stateProvider.state('zelift.map', {
                url: '/map',
                cache: false,
                views: {
                    'main': {
                        templateUrl: 'templates/map.html',
                        controller: 'map'
                    }
                }
            });

            //** Default
            $urlRouterProvider.otherwise('/zelift/home');
        });
})();

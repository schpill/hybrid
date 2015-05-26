(function() {
    'use strict';

    var iOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false;

    if (iOS) {
        document.onreadystatechange = function () {
            console.log(document.readyState);

            if (document.readyState == "complete") {
                document.body.classList.add('platform-ready');
                document.body.classList.add('platform-ios');
                document.body.classList.add('fullscreen');
            }
        }
    }

	angular
		.module('zelift')
		.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
            //** abstract route for sidemenu
            $stateProvider.state('zelift', {
                url: '/zelift',
                abstract: true,
                templateUrl: 'templates/app.html',
                controller: 'sidemenu'
            });

            //**  home
            $stateProvider.state('zelift.home', {
                url: '/home',
                cache: false,
                views: {
                    'appView': {
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
                    'appView': {
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
                    'appView': {
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
                    'appView': {
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
                    'appView': {
                        templateUrl: 'templates/offrein.html',
                        controller: 'offrein'
                    }
                }
            });

            //**  offreout
            $stateProvider.state('zelift.offreout', {
                url: '/offreout',
                cache: false,
                views: {
                    'appView': {
                        templateUrl: 'templates/offreout.html',
                        controller: 'offreout'
                    }
                }
            });

            //**  map
            $stateProvider.state('zelift.map', {
                url: '/map',
                cache: false,
                views: {
                    'appView': {
                        templateUrl: 'templates/map.html',
                        controller: 'map'
                    }
                }
            });

            //**  about
            $stateProvider.state('zelift.about', {
                url: '/about',
                cache: false,
                views: {
                    'appView': {
                        templateUrl: 'templates/about.html',
                        controller: 'about'
                    }
                }
            });

            //**  myoffers
            $stateProvider.state('zelift.myoffers', {
                url: '/myoffers',
                cache: false,
                views: {
                    'appView': {
                        templateUrl: 'templates/myoffers.html',
                        controller: 'myoffers'
                    }
                }
            });

            //**  account
            $stateProvider.state('zelift.account', {
                url: '/account',
                cache: false,
                views: {
                    'appView': {
                        templateUrl: 'templates/account.html',
                        controller: 'account'
                    }
                }
            });

            //**  myzelift
            $stateProvider.state('zelift.myzelift', {
                url: '/myzelift',
                cache: false,
                views: {
                    'appView': {
                        templateUrl: 'templates/myzelift.html',
                        controller: 'myzelift'
                    }
                }
            });

            //**  settings
            $stateProvider.state('zelift.settings', {
                url: '/settings',
                cache: false,
                views: {
                    'appView': {
                        templateUrl: 'templates/settings.html',
                        controller: 'settings'
                    }
                }
            });

            //**  localize
            $stateProvider.state('zelift.localize', {
                url: '/localize',
                cache: false,
                views: {
                    'appView': {
                        templateUrl: 'templates/localize.html',
                        controller: 'localize'
                    }
                }
            });

            //** Default
            $urlRouterProvider.otherwise('/zelift/home');
            $ionicConfigProvider.navBar.alignTitle('center');
        });
})();

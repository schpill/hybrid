(function () {
    'use strict';

    angular.module('zelift')
    .directive("appMap", function ($window) {
        return {
            restrict: "E",
            replace: true,
            template: "<div></div>",
            scope: {
                center: "=",
                width: "@",         // Map width in pixels.
                height: "@",        // Map height in pixels.
                zoom: "@",          // Zoom level (one is totally zoomed out, 25 is very much zoomed in).
                mapTypeId: "@",     // Type of tile to show on the map (roadmap, satellite, hybrid, terrain).
                panControl: "@",    // Whether to show a pan control on the map.
                zoomControl: "@",   // Whether to show a zoom control on the map.
                scaleControl: "@"   // Whether to show scale control on the map.
            },

            link: function (scope, element, attrs) {
                var toResize, toCenter;
                var map;
                var infowindow;
                var currentMarkers;
                var callbackName = 'InitMapCb';

                // callback when google maps is loaded
                $window[callbackName] = function() {
                    console.log("map: init callback");
                    createMap();
                };

                if (!$window.google || !$window.google.maps) {
                    console.log("map: not available - load now gmap js");
                    loadGMaps();
                } else {
                    console.log("map: IS available - create only map now");
                    createMap();
                }

                function loadGMaps() {
                    console.log("map: start loading js gmaps");
                    var script = $window.document.createElement('script');
                    script.type = 'text/javascript';
                    script.src = 'http://maps.googleapis.com/maps/api/js?v=3.exp&sensor=true&callback=InitMapCb';
                    $window.document.body.appendChild(script);
                }

                function createMap() {
                    console.log("map: create map start");
                    var mapOptions = {
                        zoom: 15,
                        center: new google.maps.LatLng(localStorage.getItem('latitude'), localStorage.getItem('longitude')),
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        panControl: true,
                        zoomControl: true,
                        mapTypeControl: true,
                        scaleControl: false,
                        streetViewControl: false,
                        navigationControl: true,
                        disableDefaultUI: true,
                        overviewMapControl: true
                    };

                    if (!(map instanceof google.maps.Map)) {
                        console.log("map: create map now as not already available ");
                        map = new google.maps.Map(element[0], mapOptions);

                        google.maps.event.addDomListener(element[0], 'mousedown', function(e) {
                            e.preventDefault();
                            return false;
                        });

                        infowindow = new google.maps.InfoWindow();
                    }
                }
            } // end of link:
        }; // end of return
    })
    .controller('map', mapController);

    function mapController($ionicPlatform, $http, $rootScope, $window, $scope, $ionicLoading, $compile, $filter, $state, utils, store, $stateParams, $timeout, $location) {
        $scope.viewTitle = 'Carte';
        $scope.loc();
    }

})();

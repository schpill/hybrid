(function () {
	'use strict';

	angular.module('zelift')
    .factory('jdb', function ($ionicPlatform, fs) {
        var self = this;

        self.orm = fs.init();
        self.config = {};
        self.res = {};

        self.cb = function (res) {
            return res;
        };

        self.init = function (db, table) {
            self.config.db = db;
            self.config.table = table;
            self.config.collection = db + '_' + table;

            return self;
        };

        self.makeId = function (cb) {
            self.orm.get(self.config.collection + '.counter', function (res) {
                var oldId = parseInt(res);
                var id = oldId + 1;
                self.orm.set(self.config.collection + '.counter', id);

                cb(id);
            }, 0);
        };

        self.find = function (id, cb) {
            var key = self.config.collection + '.row.' + id;

            self.orm.get(key, function (res) {
                cb(res);
            });
        };

        self.save = function (data, cb) {
            if (data.id) {
                self.update(data, cb);
            } else {
                self.insert(data, cb);
            }
        };

        self.insert = function (data, cb) {
            cb = typeof cb !== 'function' ? self.cb : cb;

            self.makeId(function (id) {
                id = parseInt(id);
                data.id = id;

                var key = self.config.collection + '.row.' + id;

                self.orm.set(key, data);

                cb(data);
            });
        };

        self.update = function (data, cb) {
            cb = typeof cb !== 'function' ? self.cb : cb;

            var id = parseInt(data.id);
            var key = self.config.collection + '.row.' + id;

            self.orm.set(key, data);
            cb(data);
        };

        self.delete = function (id, cb) {
            cb = typeof cb !== 'function' ? self.cb : cb;
            id = parseInt(id);

            var key = self.config.collection + '.row.' + id;

            self.orm.del(key);
            cb(true);
        };

        self.all = function (cb) {
            var pattern = self.config.collection + '.row.';

            self.orm.keys(pattern, function (collection) {
                var newCollection = [];

                var rep = pattern.split('.').join('_');
                self.makeCollectionId(rep, collection, newCollection, cb);
            });
        };

        self.makeCollectionId = function (rep, collection, newCollection, cb) {
            if (collection.length > 0) {
                for (var i = 0; i < collection.length; i++) {
                    var idRow = collection[i].split(rep).join('');

                    self.find(idRow, function (row) {
                        newCollection.push(row);
                        collection.shift();

                        self.makeCollectionId(rep, collection, newCollection, cb);
                    });
                }
            }

            cb(newCollection);
        }

        return self;
    })
    .factory('global', function ($ionicPlatform, fs, $window) {
        var self = this;

        self.scope = {};

        self.localize = function (cb) {
            var $scope = self.scope;

            var geoTimeout = ionic.Platform.isAndroid() ? 1500 : 1000;

            if (typeof navigator.geolocation.getCurrentPosition == 'function') {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var lat = position.coords.latitude;
                    var lng = position.coords.longitude;

                    console.log('geo first true [lng = ' + lng + ',  lat = ' + lat + ']');

                    $scope.position         = {'lng': lng, 'lat': lat};
                    $scope.user.latitude    = lat;
                    $scope.user.longitude   = lng;

                    localStorage.setItem('latitude', lat);
                    localStorage.setItem('longitude', lng);
                    localStorage.setItem('coords.age', self.now());
                    $scope.isDev = false;

                    if (typeof cb == 'function') {
                        cb();
                    }
                }, function (e) {
                    console.log('geo pb');
                    var when = localStorage.getItem('coords.age');

                    var continueCoords = true;

                    if (when) {
                        var diff = parseInt(self.now()) - parseInt(when);

                        continueCoords = diff > 3600;console.log(continueCoords);
                    }

                    if ($scope.connected && $scope.user.lat && $scope.user.lng) {
                        $scope.position         = {'lng': $scope.user.lng, 'lat': $scope.user.lat};
                        $scope.user.latitude    = $scope.user.lat;
                        $scope.user.longitude   = $scope.user.lng;

                        localStorage.setItem('latitude', $scope.user.lat);
                        localStorage.setItem('longitude', $scope.user.lng);
                        localStorage.setItem('coords.age', self.now());
                        $scope.isDev = false;
                        console.log('geo address [lng = ' + $scope.user.lng + ',  lat = ' + $scope.user.lat + ']');

                        if (typeof cb == 'function') {
                            cb();
                        }
                    } else {
                        if ($scope.connected) {
                            $scope.signOut();
                        } else {
                            var memLat = localStorage.getItem('latitude');
                            var memLng = localStorage.getItem('longitude');

                            if (!memLat || !memLng) {
                                if (typeof cb == 'function') {
                                    $scope.cb = cb;
                                }

                                $scope.go('zelift.localize');
                            }
                        }
                    }

                    // if (geoip2 && continueCoords) {
                    //     geoip2.city(function (l) {
                    //         console.log('geoip');
                    //         $scope.loc = l.location;
                    //         $scope.traits = l.traits;
                    //         console.log(JSON.stringify($scope.loc));
                    //         console.log(JSON.stringify($scope.traits));

                    //         var lat = l.location.latitude;
                    //         var lng = l.location.longitude;

                    //         console.log('geo true [lng = ' + lng + ',  lat = ' + lat + ']');

                    //         $scope.position         = {'lng': lng, 'lat': lat};
                    //         $scope.user.latitude    = lat;
                    //         $scope.user.longitude   = lng;

                    //         localStorage.setItem('latitude', lat);
                    //         localStorage.setItem('longitude', lng);
                    //         localStorage.setItem('coords.age', self.now());
                    //         $scope.isDev = false;

                    //     }, function (e) {
                    //         console.log(e.message);
                    //         var cacheLat = localStorage.getItem('latitude');
                    //         var cacheLng = localStorage.getItem('longitude');

                    //         var latitude = cacheLat ? cacheLat : 47.324146;
                    //         var longitude = cacheLng ? cacheLng : 5.034246;

                    //         var latitude = 47.324146;
                    //         var longitude = 5.034246;

                    //         if ($scope.user) {
                    //             if ($scope.user.sellzone) {
                    //                 if ($scope.user.sellzone.latitude) {
                    //                     latitude = $scope.user.sellzone.latitude;
                    //                 }

                    //                 if ($scope.user.sellzone.longitude) {
                    //                     longitude = $scope.user.sellzone.longitude;
                    //                 }
                    //             }
                    //         }

                    //         console.log('sellzone coords');

                    //         $scope.position = {'longitude': longitude, 'latitude': latitude};
                    //         $scope.user.latitude    = $scope.position.latitude;
                    //         $scope.user.longitude   = $scope.position.longitude;
                    //         localStorage.setItem('latitude', $scope.user.latitude);
                    //         localStorage.setItem('longitude', $scope.user.longitude);
                    //     });
                    // } else {
                    //     console.log('geoloc cache');

                    //     var cacheLat = localStorage.getItem('latitude');
                    //     var cacheLng = localStorage.getItem('longitude');

                    //     var latitude = cacheLat ? cacheLat : 47.324146;
                    //     var longitude = cacheLng ? cacheLng : 5.034246;

                    //     if ($scope.user) {
                    //         if ($scope.user.sellzone) {
                    //             if ($scope.user.sellzone.latitude) {
                    //                 latitude = $scope.user.sellzone.latitude;
                    //             }

                    //             if ($scope.user.sellzone.longitude) {
                    //                 longitude = $scope.user.sellzone.longitude;
                    //             }
                    //         }
                    //     }

                    //     console.log('sellzone coords');

                    //     $scope.position = {'longitude': longitude, 'latitude': latitude};
                    //     $scope.user.latitude    = $scope.position.latitude;
                    //     $scope.user.longitude   = $scope.position.longitude;
                    //     localStorage.setItem('latitude', $scope.user.latitude);
                    //     localStorage.setItem('longitude', $scope.user.longitude);
                    // }
                }, {timeout: geoTimeout, enableHighAccuracy: true});
            }
        };

        self.setScope = function (scope) {
            self.scope = scope;
        };

        self.now = function () {
            return Math.floor(Date.now() / 1000);
        };

        return self;
    })

    .factory('ls', function($window) {
        return {
            set: function(key, value) {
                $window.localStorage.setItem(key, value);
            },

            get: function(key, defaultValue) {
                defaultValue = typeof defaultValue == 'undefined' ? null : defaultValue;

                var val = $window.localStorage.getItem(key);

                if (!val) {
                    val = defaultValue;
                }

                return val;
            },

            setObject: function(key, value) {
                $window.localStorage.setItem(key, JSON.stringify(value));
            },

            getObject: function(key, defaultValue) {
                defaultValue = typeof defaultValue == 'undefined' ? '{}' : defaultValue;
                var val = $window.localStorage.getItem(key);

                if (!val) {
                    val = defaultValue;
                }

                return typeof val == 'string' && val.match('{') ? JSON.parse(val) : val;
            },

            removeItem: function(key) {
                $window.localStorage.removeItem(key);
            }
        }
    })

    .controller('sidemenu', SideMenu);

	function SideMenu($state, $scope, $rootScope, $ionicSideMenuDelegate, $cordovaSocialSharing, utils, store, $ionicPlatform, cache, fs, $cordovaDevice, $ionicPopup, $ionicLoading, $window, $http, $location, $ionicModal, $ionicActionSheet, $timeout, $log, $ionicPopover, $ionicHistory, global, jdb, $cordovaPush, memo, $ionicSlideBoxDelegate, $ionicGesture, UUID, ls) {
        global.setScope($scope);

        $scope.isDev      = true;
        $scope.isMapped   = false;
		$scope.isWebView  = ionic.Platform.isWebView();
		$scope.isIos      = ionic.Platform.isIOS();
		$scope.isWin      = ionic.Platform.isWindowsPhone();
        $scope.store      = function () {return memo.init();};
        $scope.utils      = utils;
        $scope.serverUrl  = 'http://www.zelift.com';

        $scope.user = angular.fromJson(localStorage.getItem('user'));

        $scope.connected = $scope.user !== null;

        if (!$scope.connected) {
            $scope.user = {};
        }

        $scope.platformReady = false;

        var uuid = ls.get('myUuid');

        uuid = uuid ? uuid : UUID.make();
        var device = device ? device : null;

        ls.set('myUuid', uuid);

        $rootScope.uuid = uuid;

        console.log(uuid);

        if (window.cordova) {
            $ionicPlatform.ready(function () {
                $scope.platformReady = true;

                if (device) {
                    $scope.user.model       = $cordovaDevice.getModel();
                    $scope.user.platform    = $cordovaDevice.getPlatform();
                    $scope.user.version     = $cordovaDevice.getVersion();
                }

                $scope.user.uuid        = $rootScope.uuid;

                // var myDb = jdb.init('core', 'test');

                // myDb.all(function (data) {
                //     console.log('ALL => ' + JSON.stringify(data));
                // });

                // $scope.db = $cordovaSQLite.openDB({name: "zelift.db", bgType: 1});

                // $scope.hasLite = typeof $scope.db === 'object';

                // var q = "CREATE TABLE IF NOT EXISTS zecache (id integer primary key, keycache text, valuecache text, expirecache integer)";

                // $cordovaSQLite.execute($scope.db, q, []).then(function(res) {
                //     console.log("Table zecache created");
                // }, function (err) {
                //     console.error(err);
                // });

                // $cordovaGeolocation
                // .getCurrentPosition({timeout: 1000, enableHighAccuracy: true})
                // .then(function (position) {
                //     var lat  = position.coords.latitude;
                //     var lng = position.coords.longitude;
                // }, function(e) {
                //     console.log(e.message);
                // });

                if ($scope.connected) {
                    global.localize();
                }

                // var fsys = fs.init();

                // fsys.set('c.l', 'test cache');

                // fsys.get('c.l', function (data) {console.log(data);
                //     $scope.test = data;
                // }, '250');

                // $scope.zeStore().set('trucs', ['a',5,4]);

                // $scope.zeStore().get('trucs', function (res) {
                //     console.log(res[0]);
                // }, 25);
            });
        }

        $scope.addSlashes = function(str) {
            return str.split("'").join("''");
        };

        $scope.zeStore = function () {
            var self = this;

            return fs.init();
        };

        $scope.miniDb = function () {
            var self = this;

            self.set = function (key, value) {
                localStorage.setItem(key, JSON.stringify(value));

                return self;
            }

            self.get = function (key, cb, defaultVal) {
                var returnValue = localStorage.getItem(key);

                if (!returnValue) {
                    returnValue = defaultVal;
                } else {
                    returnValue = JSON.parse(returnValue);
                }

                cb(returnValue);
            };

            self.has = function (key, cb) {
                var returnValue = localStorage.getItem(key);

                if (!returnValue) {
                    cb(false);
                } else {
                    cb(true);
                }
            };

            self.delete = function(key, cb) {
                localStorage.removeItem(key);
                cb();
            };

            self.removeRemember = function(key) {
                for (var i = 0; i < localStorage.length; i++) {
                   var name = localStorage.key(i);

                    if (name.match(key)) {
                        localStorage.removeItem(name);
                    }
                }
            };

            return self;
        };

        $scope.addRemember = function (name, valueKey) {
            $scope.store().set('remember.' + name, valueKey);

            if ($scope.platformReady) {
                console.log('add ' + name);
                var fsys = $scope.zeStore();
                fsys.set('remember.' + name, valueKey);
            } else {
                $timeout(function() {
                    var fsys = $scope.zeStore();
                    fsys.set('remember.' + name, valueKey);
                }, 500);
            }
        };

        $scope.delRemember = function (name) {
            $scope.store().del('remember.' + name, valueKey);

            if ($scope.platformReady) {
                console.log('del ' + name);
                var fsys = $scope.zeStore();
                fsys.del('remember.' + name);
            } else {
                $timeout(function() {
                    var fsys = $scope.zeStore();
                    fsys.del('remember.' + name);
                }, 500);
            }
        };

        $scope.remember = function (name, cb1, cb2) {
            var cache = $scope.store().get('remember.' + name);

            if (cache) {
                console.log("memoCache => " + name);
                cb2(cache);
            } else {
                if ($scope.platformReady) {
                    console.log(typeof $scope.db);
                    var fsys = $scope.zeStore();

                    fsys.get('remember.' + name, function (data) {
                        if (data == 'dummy') {
                            cb1();
                        } else {
                            $scope.store().set('remember.' + name, data);
                            cb2(data);
                        }
                    }, 'dummy');
                } else {
                    $timeout(function() {
                        var fsys = $scope.zeStore();

                        fsys.get('remember.' + name, function (data) {
                            if (data == 'dummy') {
                                cb1();
                            } else {
                                $scope.store().set('remember.' + name, data);
                                cb2(data);
                            }
                        }, 'dummy');
                    }, 500);
                }
            }
        };

        $scope.getRemember = function (name, cb, defaultVal) {
            if (typeof(defaultVal) == 'undefined') {
                defaultVal = null;
            }

            var cache = $scope.store().get('remember.' + name);

            if (cache) {
                cb(cache);
            } else {
                var fsys = $scope.zeStore();

                fsys.get('remember.' + name, function (data) {
                    $scope.store().set('remember.' + name, data);
                    cb(data);
                }, defaultVal);
            }
        };

        $scope.clearCache = function () {
            $scope.store().delPattern('remember.');

            if ($scope.platformReady) {
                var fsys = $scope.zeStore();

                fsys.removeRemember();

                $ionicPopup.alert({
                    title: '<i class="fa fa-check-square-o fa-3x zeliftColor"><i>',
                    template: 'Cache vidé',
                    buttons: [{
                        text: 'OK',
                        type: 'button button-full button-zelift'
                    }]
                });
            } else {
                $timeout(function() {
                    var fsys = $scope.zeStore();

                    fsys.removeRemember();

                    $ionicPopup.alert({
                        title: '<i class="fa fa-check-square-o fa-3x zeliftColor"><i>',
                        template: 'Cache vidé',
                        buttons: [{
                            text: 'OK',
                            type: 'button button-full button-zelift'
                        }]
                    });
                }, 500);
            }
        };

        // $scope.loc = function () {
        //     if (!$scope.isDev && google.loader.ClientLocation) {
        //         var lat = google.loader.ClientLocation.latitude;
        //         var lng = google.loader.ClientLocation.longitude;

        //         console.log('geo true [lng = ' + lng + ',  lat = ' + lat + ']');

        //         $scope.position         = {'lng':lng,'lat':lat};
        //         $scope.user.latitude    = lat;
        //         $scope.user.longitude   = lng;

        //         localStorage.setItem('latitude', lat);
        //         localStorage.setItem('longitude', lng);
        //     } else {
        //         console.log('geo false');
        //         $scope.position = {'longitude':5.034246,'latitude':47.324146};
        //         $scope.user.latitude    = $scope.position.latitude;
        //         $scope.user.longitude   = $scope.position.longitude;
        //         localStorage.setItem('latitude', $scope.user.latitude);
        //         localStorage.setItem('longitude', $scope.user.longitude);
        //     }
        // };

        $scope.locate = function () {
            var geoTimeout = ionic.Platform.isAndroid() ? 15000 : 1000;

            navigator.geolocation.getCurrentPosition(function (position) {
                var lat = position.coords.latitude;
                var lng = position.coords.longitude;

                console.log('geo first true [lng = ' + lng + ',  lat = ' + lat + ']');

                $scope.position         = {'lng': lng, 'lat': lat};
                $scope.user.latitude    = lat;
                $scope.user.longitude   = lng;

                localStorage.setItem('latitude', lat);
                localStorage.setItem('longitude', lng);
                localStorage.setItem('coords.age', global.now());
                $scope.isDev = false;
            }, function (e) {
                console.log('geo pb');
            }, {timeout: geoTimeout, enableHighAccuracy: true});
        };

		$scope.exit = function () {
			ionic.Platform.exitApp();
		};

		$scope.shareAnywhere = function() {
        	$cordovaSocialSharing.share("This is your message", "This is your subject", 'img/share.png', "http://app.zelift.com").then(function(result) {
                console.log('OK SHARING');
            }, function(err) {
              // An error occured. Show a message to the user
            });
    	};

        $scope.geo = function () {
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({
                'latLng': new google.maps.LatLng(localStorage.getItem('latitude'), localStorage.getItem('longitude'))
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results.length > 1) {
                        var r = results[1]['formatted_address'];
                        console.log(JSON.stringify(r));
                    }
                } else {
                  console.log('reverse fail', results, status);
                }
            });
        };

        $scope.isMenuLeftOpened = false;
        $scope.isMenuRightOpened = false;

        $scope.$watch(
            function () {
                return $ionicSideMenuDelegate.isOpenRight();
            },
            function (isOpenRight) {
                if (!isOpenRight) {
                    $scope.isMenuRightOpened = false;
                } else {
                    $scope.isMenuRightOpened = true;
                }
            }
        );

        $scope.$watch(
            function () {
                return $ionicSideMenuDelegate.isOpenLeft();
            },
            function (isOpenLeft) {
                if (!isOpenLeft) {
                    $scope.isMenuLeftOpened = false;
                } else {
                    $scope.isMenuLeftOpened = true;
                }
            }
        );

        $scope.go = function (page) {
            $state.go(page);
        };

        $scope.refreshMe = function () {
            $window.location.reload(true);
        };

        $scope.signupData = {};
        $scope.loginData = {};

        $scope.loginData.email = localStorage.getItem('email');

        $ionicModal.fromTemplateUrl('templates/register.html', {
            scope: $scope
            // animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.registerModal = modal;
        });

        $scope.closeRegister = function() {
            $scope.registerModal.hide();
        };

        $scope.signup = function() {
            var memLat = localStorage.getItem('latitude');
            var memLng = localStorage.getItem('longitude');

            if (!memLat || !memLng) {
                global.localize();
            } else {
                $scope.registerModal.show();
            }
        };

        $scope.signOut = function () {
            localStorage.removeItem('user');
            localStorage.removeItem('latitude');
            localStorage.removeItem('longitude');

            $timeout(function() {
                $scope.connected = false;
                $scope.go('zelift.home');
            }, 300);
        };

        $scope.doLogin = function(form) {
            if (form.$valid) {
                $scope.loginData.infos = {
                    'latitude' : $scope.user.latitude,
                    'longitude' : $scope.user.longitude,
                    'version' : $scope.user.version,
                    'uuid' : $scope.user.uuid,
                    'platform' : $scope.user.platform,
                    'model' : $scope.user.model,
                    'regid' : localStorage.getItem('regid')
                };

                console.log(JSON.stringify($scope.loginData));

                $http.post($rootScope.apiUrl + 'login', $scope.loginData)
                .success(function(data) {
                    switch (data.status) {
                        case 200:
                            $scope.user = data.user;
                            $scope.user.token = data.token;

                            localStorage.setItem('user', angular.toJson($scope.user));
                            localStorage.setItem('email', $scope.user.email);

                            $timeout(function() {
                                $scope.connected = true;

                                global.localize();

                                $scope.closeRegister();
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
                    $log.log($rootScope.apiUrl + 'login');
                    $log.log(status);
                });
            } else {
                $ionicPopup.alert({
                    title: '<i class="fa fa-exclamation-triangle fa-3x zeliftColor"><i>',
                    template: 'Merci de renseigner un courriel et un mot de passe valideS.',
                    buttons: [{
                        text: 'OK',
                        type: 'button button-full button-zelift'
                    }]
                });
            }
        };

        $scope.doSignup = function(form) {
            if (form.$valid) {
                if ($scope.signupData.password == $scope.signupData.password2) {
                    $scope.signupData.infos = {
                        'latitude' : $scope.user.latitude,
                        'longitude' : $scope.user.longitude,
                        'version' : $scope.user.version,
                        'uuid' : $scope.user.uuid,
                        'platform' : $scope.user.platform,
                        'model' : $scope.user.model
                    };

                    $http.post($rootScope.apiUrl + 'register', $scope.signupData)
                    .success(function(data) {
                        switch (data.status) {
                            case 200:
                                $scope.user = data.user;
                                $scope.user.token = data.token;

                                localStorage.setItem('user', angular.toJson($scope.user));
                                localStorage.setItem('email', $scope.user.email);

                                $timeout(function() {
                                    $scope.connected = true;
                                    $scope.loc();
                                    $scope.closeRegister();
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
                        $log.log($rootScope.apiUrl + 'register');
                        $log.log(status);
                    });
                } else {
                    $ionicPopup.alert({
                        title: '<i class="fa fa-exclamation-triangle fa-3x zeliftColor"><i>',
                        template: 'Les deux mots de passe ne sont pas identiques.',
                        buttons: [{
                            text: 'OK',
                            type: 'button button-full button-zelift'
                        }]
                    });


                    $scope.signupData.password = '';
                    $scope.signupData.password2 = '';
                }
            } else {
                if ($scope.signupData.genre != 1 && $scope.signupData.genre != 2) {
                    $ionicPopup.alert({
                        title: '<i class="fa fa-exclamation-triangle fa-3x zeliftColor"><i>',
                        template: 'Merci de renseigner une civilité.',
                        buttons: [{
                            text: 'OK',
                            type: 'button button-full button-zelift'
                        }]
                    });
                } else {
                    $ionicPopup.alert({
                        title: '<i class="fa fa-exclamation-triangle fa-3x zeliftColor"><i>',
                        template: 'Le mot de passe est trop court.',
                        buttons: [{
                            text: 'OK',
                            type: 'button button-full button-zelift'
                        }]
                    });

                    $scope.signupData.password = '';
                    $scope.signupData.password2 = '';
                }
            }
        };

        $scope.findSellzone = function () {
            if ($scope.connected) {
                $scope.remember('sz', function () {
                    $scope.findDb('sellzone', $scope.user.sellzone_id, function (res) {
                        $scope.user.sellzone = res;
                        $scope.addRemember('sz', res);
                    });
                }, function (res) {
                    $scope.user.sellzone = res;
                });
            }
        };

        $scope.findDb = function (table_row, id_row, cb) {
            var keyCache = 'db.find.' + table_row + id_row;

            var cache = $scope.store().get(keyCache);

            if (cache) {
                console.log('dbCache.' + keyCache);
                cb(cache);
            } else {
                $http.post($rootScope.apiUrl + 'find', {'table': table_row, 'id': id_row, 'token': $scope.user.token})
                .success(function(data) {
                    switch (data.status) {
                        case 200:
                            console.log('OK find row ' + id_row + ' on ' + table_row);
                            $scope.store().set(keyCache, data.results);
                            cb(data.results);
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
                    $log.log($rootScope.apiUrl + 'findDb');
                    $log.log(status);
                });
            }
        };

        $ionicPopover.fromTemplateUrl('templates/right.html', {
            scope: $scope,
        }).then(function(popover) {
            $scope.popover = popover;
        });

        $scope.goBack = function () {
            $ionicHistory.goBack();
        };

        $http.get($rootScope.apiUrl + 'ip').success(function (data) {
            var f = fs.init();
            var db = f.db;
            var row = db.create('person', {name:'Plusquellec'});

            console.log(JSON.stringify(row));

            $scope.user.ip = data.ip;

            console.log('ici => ' + $scope.user.ip);
            // d.appendChild(c);
        }).error(function () {
            console.log('PB => ' + $rootScope.apiUrl + 'ip');
        });

        $scope.setPlatform = function(p) {
            document.body.classList.remove('platform-ios');
            document.body.classList.remove('platform-android');
            document.body.classList.add('platform-' + p);
        };


        $scope.goSlide = function(index) {
            $ionicSlideBoxDelegate.slide(index);
        };

        $scope.showDrawer = function() {
            if ($('.drawer').is(":visible")) {
                // $('#appView').css({"opacity":1, '-webkit-transition':'opacity 150ms ease-in-out', 'transition':'opacity 150ms ease-in-out'});

                $(".loadDiv").animate({width:'toggle'}, 150);
                $(".drawer").animate({width:'toggle'}, 150);

                $('#naviconBtn').removeClass('ion-arrow-left-c');
                $('#naviconBtn').addClass('ion-navicon');

                $('.homeBtnNav').show();
                $('.homeBtnBack').hide();
                $scope.openedDrawer = false;
            } else {
                // $('#appView').css({"opacity":0.3, '-webkit-transition':'opacity 150ms ease-in-out', 'transition':'opacity 150ms ease-in-out'});

                $('#naviconBtn').removeClass('ion-navicon');
                $('#naviconBtn').addClass('ion-arrow-left-c');

                $(".drawer").animate({width:'toggle'}, 150);

                $('.homeBtnNav').hide();
                $('.homeBtnBack').show();
                $(".loadDiv").animate({width:'toggle'}, 150);

                $timeout(function () {
                    $scope.openedDrawer = true;
                }, 100);
            }
        };

        $window.onclick = function (event) {
            if ($scope.openedDrawer) {
                var target = $(event.target);

                if (!target.hasClass("drawer")) {
                    $(".loadDiv").animate({width:'toggle'}, 150);
                    $(".drawer").animate({width:'toggle'}, 150);

                    $('#naviconBtn').removeClass('ion-arrow-left-c');
                    $('#naviconBtn').addClass('ion-navicon');

                    $('.homeBtnNav').show();
                    $('.homeBtnBack').hide();
                    $scope.openedDrawer = false;
                }
            } else {
                return true;
            }
        };

        // $scope.setPlatform('ios');

        if ($('body').hasClass('platform-ios')) {
            $('body').addClass('fullscreen')
        }

        var element = angular.element(document.querySelector('#appView'));

        $ionicGesture.on('dragright', function (event) {
            var can = !document.URL.match('signin');

            if (event.gesture.touches[0].pageX < 30 && can) {
                $scope.showDrawer();
            }
        }, element);

        // var element = angular.element(document.querySelector('#appView'));

        // $ionicGesture.on('dragright', function (event) {
        //     $scope.$apply(function () {
        //         if (!$scope.openedDrawer) {
        //             $('#naviconBtn').removeClass('ion-navicon');
        //             $('#naviconBtn').addClass('ion-arrow-left-c');

        //             $(".drawer").animate({width:'toggle'}, 150);

        //             $('.homeBtnNav').hide();
        //             $('.homeBtnBack').show();
        //             $(".loadDiv").animate({width:'toggle'}, 150);

        //             $scope.openedDrawer = true;
        //         }
        //     });
        // }, element);

        // var element = angular.element(document.querySelector('.loadDiv'));

        // $ionicGesture.on('dragleft', function (event) {
        //     $scope.$apply(function () {
        //         if ($scope.openedDrawer) {
        //             $(".loadDiv").animate({width:'toggle'}, 150);
        //             $(".drawer").animate({width:'toggle'}, 150);

        //             $('#naviconBtn').removeClass('ion-arrow-left-c');
        //             $('#naviconBtn').addClass('ion-navicon');

        //             $('.homeBtnNav').show();
        //             $('.homeBtnBack').hide();
        //             $('#appView').css({"opacity":1, '-webkit-transition':'opacity 150ms ease-in-out', 'transition':'opacity 150ms ease-in-out'});
        //             $scope.openedDrawer = false;
        //         }
        //     });
        // }, element);
	}
})();

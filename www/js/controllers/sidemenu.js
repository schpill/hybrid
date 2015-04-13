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

                    self.find(idRow, function (row) {console.log('uid ' + row);
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

        self.localize = function () {
            var $scope = self.scope;

            var geoTimeout = ionic.Platform.isAndroid() ? 1000 : 1000;

            if (typeof navigator.geolocation.getCurrentPosition == 'function') {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var lat = position.coords.latitude;
                    var lng = position.coords.longitude;

                    console.log('geo true [lng = ' + lng + ',  lat = ' + lat + ']');

                    $scope.position         = {'lng': lng, 'lat': lat};
                    $scope.user.latitude    = lat;
                    $scope.user.longitude   = lng;

                    localStorage.setItem('latitude', lat);
                    localStorage.setItem('longitude', lng);
                    $scope.isDev = false;
                }, function (e) {
                    if (geoip2) {
                        geoip2.city(function (l) {
                            console.log('geoip');
                            $scope.loc = l.location;
                            $scope.traits = l.traits;
                            console.log(JSON.stringify($scope.loc));
                            console.log(JSON.stringify($scope.traits));

                            var lat = l.location.latitude;
                            var lng = l.location.longitude;

                            console.log('geo true [lng = ' + lng + ',  lat = ' + lat + ']');

                            $scope.position         = {'lng': lng, 'lat': lat};
                            $scope.user.latitude    = lat;
                            $scope.user.longitude   = lng;

                            localStorage.setItem('latitude', lat);
                            localStorage.setItem('longitude', lng);
                            $scope.isDev = false;

                        }, function (e) {
                            console.log(e.message);
                            var latitude = 47.324146;
                            var longitude = 5.034246;

                            if ($scope.user) {
                                if ($scope.user.sellzone) {
                                    if ($scope.user.sellzone.latitude) {
                                        latitude = $scope.user.sellzone.latitude;
                                    }

                                    if ($scope.user.sellzone.longitude) {
                                        longitude = $scope.user.sellzone.longitude;
                                    }
                                }
                            }

                            console.log('sellzone coords');

                            $scope.position = {'longitude': longitude, 'latitude': latitude};
                            $scope.user.latitude    = $scope.position.latitude;
                            $scope.user.longitude   = $scope.position.longitude;
                            localStorage.setItem('latitude', $scope.user.latitude);
                            localStorage.setItem('longitude', $scope.user.longitude);
                        });
                    } else {
                        console.log('no network to localize');
                        var latitude = 47.324146;
                        var longitude = 5.034246;

                        if ($scope.user) {
                            if ($scope.user.sellzone) {
                                if ($scope.user.sellzone.latitude) {
                                    latitude = $scope.user.sellzone.latitude;
                                }

                                if ($scope.user.sellzone.longitude) {
                                    longitude = $scope.user.sellzone.longitude;
                                }
                            }
                        }

                        console.log('sellzone coords');

                        $scope.position = {'longitude': longitude, 'latitude': latitude};
                        $scope.user.latitude    = $scope.position.latitude;
                        $scope.user.longitude   = $scope.position.longitude;
                        localStorage.setItem('latitude', $scope.user.latitude);
                        localStorage.setItem('longitude', $scope.user.longitude);
                    }
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
    .controller('sidemenu', SideMenu);

	function SideMenu($state, $scope, $rootScope, $ionicSideMenuDelegate, $cordovaSocialSharing, utils, store, $ionicPlatform, cache, fs, $cordovaDevice, $ionicPopup, $ionicLoading, $window, $http, $location, $ionicModal, $ionicActionSheet, $timeout, $log, $ionicPopover, $ionicHistory, global, jdb, $cordovaPush, memo) {

        global.setScope($scope);

        $scope.isDev      = true;
		$scope.isWebView  = ionic.Platform.isWebView();
		$scope.isIos      = ionic.Platform.isIOS();
		$scope.isWin      = ionic.Platform.isWindowsPhone();
        $scope.store      = function () {return memo.init();};
        $scope.utils      = utils;
        $scope.serverUrl  = 'http://zelift.inovigroupe.com';

        $scope.user = angular.fromJson(localStorage.getItem('user'));

        $scope.connected = $scope.user !== null;

        if (!$scope.connected) {
            $scope.user = {};
        }

        $scope.platformReady = false;

        if (window.cordova) {
            $ionicPlatform.ready(function () {
                $scope.platformReady    = true;
                $scope.user.model       = $cordovaDevice.getModel();
                $scope.user.platform    = $cordovaDevice.getPlatform();
                $scope.user.uuid        = $cordovaDevice.getUUID();
                $scope.user.version     = $cordovaDevice.getVersion();

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

                global.localize();

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

            self.set = function (key, value) {
                var q = "DELETE FROM zecache WHERE keycache = '" + key + "'";

                $cordovaSQLite.execute($scope.db, q, []).then(function(res) {
                    console.log('OK delete');
                }, function (err) {
                    console.error(err.message);
                });

                var q = "INSERT INTO zecache (keycache, valuecache, expirecache) VALUES ('" + key + "', '" + $scope.addSlashes(JSON.stringify(value)) + "', '0')";

                $cordovaSQLite.execute($scope.db, q, []).then(function(res) {
                    console.log('OK insert');
                }, function (err) {
                    console.error(err.message);
                });

                return self;
            }

            self.get = function (key, cb, defaultVal) {
                if (typeof(defaultVal) == 'undefined') {
                    defaultVal = null;
                }

                var q = "SELECT valuecache FROM zecache WHERE keycache = '" + key + "'";

                $cordovaSQLite.execute($scope.db, q, []).then(function(res) {
                    var ret;

                    if (res.rows.length == 0) {
                        ret = defaultVal;
                    } else {
                        var seg = res.rows.item(0);
                        ret = JSON.parse(seg.valuecache);
                    }

                    cb(ret);
                }, function (err) {
                    console.error(err.message);
                });
            };

            self.has = function (key, cb) {
                var q = "SELECT valuecache FROM zecache WHERE keycache = '" + key + "'";

                $cordovaSQLite.execute($scope.db, q, []).then(function(res) {
                    if (res.rows.length == 0) {
                        cb(false);
                    } else {
                        cb(true);
                    }
                }, function (err) {
                    console.error(err.message);
                });
            };

            self.delete = function(key, cb) {
                var q = "DELETE FROM zecache WHERE keycache = '" + key + "'";

                $cordovaSQLite.execute($scope.db, q, []).then(function(res) {
                    console.log('OK delete');
                    cb();
                }, function (err) {
                    console.error(err.message);
                });
            };

            self.removeRemember = function(key) {
                var q = "DELETE FROM zecache WHERE keycache LIKE 'remember.%'";

                $cordovaSQLite.execute($scope.db, q, []).then(function(res) {
                    console.log('OK delete remember');
                }, function (err) {
                    console.error(err.message);
                });
            };

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
            $scope.loc();
            $scope.go('zelift.home');
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
        }).then(function(modal) {
            $scope.registerModal = modal;
        });

        $scope.closeRegister = function() {
            $scope.registerModal.hide();
        };

        $scope.signup = function() {
            $scope.registerModal.show();
        };

        $scope.signOut = function () {
            localStorage.removeItem('user');

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
	}
})();

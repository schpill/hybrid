(function () {
	'use strict';

	angular.module('zelift')
    .controller('sidemenu', SideMenu);

	function SideMenu($state, $scope, $rootScope, $ionicSideMenuDelegate, $cordovaSocialSharing, utils, store, $cordovaSQLite, $ionicPlatform, cache, fs, $cordovaDevice, $ionicPopup, $ionicLoading, $window, $http, $location, $ionicModal, $ionicActionSheet, $timeout, $log, $cordovaGeolocation, $ionicPopover, $ionicHistory) {
        $scope.isDev = true;
		$scope.isWebView  = ionic.Platform.isWebView();
		$scope.isIos      = ionic.Platform.isIOS();
		$scope.isWin      = ionic.Platform.isWindowsPhone();
        $scope.store      = store;
        $scope.utils      = utils;
        $scope.serverUrl  = 'http://192.168.1.17/res';

        $scope.user = angular.fromJson(localStorage.getItem('user'));

        $scope.connected = $scope.user !== null;

        if (!$scope.connected) {
            $scope.user = {};
        }

        if (window.cordova) {
            $ionicPlatform.ready(function () {
                $scope.user.model       = $cordovaDevice.getModel();
                $scope.user.platform    = $cordovaDevice.getPlatform();
                $scope.user.uuid        = $cordovaDevice.getUUID();
                $scope.user.version     = $cordovaDevice.getVersion();

                $scope.db = $cordovaSQLite.openDB({name: "zelift.db", bgType: 1});

                var q = "CREATE TABLE IF NOT EXISTS zecache (id integer primary key, keycache text, valuecache text, expirecache integer)";

                $cordovaSQLite.execute($scope.db, q, []).then(function(res) {
                    console.log("Table zecache created");
                }, function (err) {
                    console.error(err);
                });

                $scope.zeStore = function () {
                    var self = this;

                    self.set = function (key, value) {
                        var q = "DELETE FROM zecache WHERE keycache = '" + key + "'";

                        $cordovaSQLite.execute($scope.db, q, []).then(function(res) {
                            console.log('OK delete');
                        }, function (err) {
                            console.error(err.message);
                        });

                        var q = "INSERT INTO zecache (keycache, valuecache, expirecache) VALUES ('" + key + "', '" + JSON.stringify(value) + "', '0')";

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

                    return self;
                };

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

        $scope.loc = function () {
            if (!$scope.isDev) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    $rootScope.$apply(function() {
                        console.log('Coords');
                        $scope.position         = position.coords;
                        $scope.user.latitude    = position.coords.latitude;
                        $scope.user.longitude   = position.coords.longitude;

                        localStorage.setItem('latitude', $scope.user.latitude);
                        localStorage.setItem('longitude', $scope.user.longitude);
                        localStorage.setItem('coords.age', position.timestamp);
                    });
                }, function (error) {}, {timeout: 1000, enableHighAccuracy: true, maximumAge: 90000});
            } else {
                $scope.position = {'longitude':5.034246,'latitude':47.324146};
                $scope.user.latitude    = $scope.position.latitude;
                $scope.user.longitude   = $scope.position.longitude;
                localStorage.setItem('latitude', $scope.user.latitude);
                localStorage.setItem('longitude', $scope.user.longitude);
            }
        };

        $scope.loc();

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
                    'model' : $scope.user.model
                };

                $http.post($rootScope.apiUrl + 'login', $scope.loginData)
                .success(function(data) {
                    switch (data.status) {
                        case 200:
                            $scope.user = data.user;
                            $scope.user.token = data.token;
                            console.log($scope.user.sellzone_id);

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
            $scope.findDb('sellzone', $scope.user.sellzone_id, function (res) {
                $scope.user.sellzone = res;
            });
        };

        $scope.findDb = function (table_row, id_row, cb) {
            $http.post($rootScope.apiUrl + 'find', {'table': table_row, 'id': id_row, 'token': $scope.user.token})
            .success(function(data) {
                switch (data.status) {
                    case 200:
                    console.log('OK find row ' + id_row + ' on ' + table_row);
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
        };

        $ionicPopover.fromTemplateUrl('templates/right.html', {
            scope: $scope,
        }).then(function(popover) {
            $scope.popover = popover;
            $scope.findSellzone();
        });

        $scope.goBack = function () {
            $ionicHistory.goBack();
        };
	}
})();

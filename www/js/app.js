(function () {
    'use strict';

    /**
     * Define the main application module.
     */
    angular
        .module('zelift', ['ionic', 'ngCordova'])
        .factory('sha1', function() {
            return {

                name: 'SHA1',
                readonly: true,

                encode: function(input) {
                    function rotate_left(n,s) {
                        var t4 = ( n<<s ) | (n>>>(32-s));
                        return t4;
                    };

                    function lsb_hex(val) {
                        var str="";
                        var i;
                        var vh;
                        var vl;

                        for( i=0; i<=6; i+=2 ) {
                            vh = (val>>>(i*4+4))&0x0f;
                            vl = (val>>>(i*4))&0x0f;
                            str += vh.toString(16) + vl.toString(16);
                        }
                        return str;
                    };

                    function cvt_hex(val) {
                        var str="";
                        var i;
                        var v;

                        for( i=7; i>=0; i-- ) {
                            v = (val>>>(i*4))&0x0f;
                            str += v.toString(16);
                        }
                        return str;
                    };


                    function Utf8Encode(input) {
                        input = input.replace(/\r\n/g,"\n");
                        var utftext = "";

                        for (var n = 0; n < input.length; n++) {

                            var c = input.charCodeAt(n);

                            if (c < 128) {
                                utftext += String.fromCharCode(c);
                            }
                            else if((c > 127) && (c < 2048)) {
                                utftext += String.fromCharCode((c >> 6) | 192);
                                utftext += String.fromCharCode((c & 63) | 128);
                            }
                            else {
                                utftext += String.fromCharCode((c >> 12) | 224);
                                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                                utftext += String.fromCharCode((c & 63) | 128);
                            }
                        }

                        return utftext;
                    };

                    var blockstart;
                    var i, j;
                    var W = new Array(80);
                    var H0 = 0x67452301;
                    var H1 = 0xEFCDAB89;
                    var H2 = 0x98BADCFE;
                    var H3 = 0x10325476;
                    var H4 = 0xC3D2E1F0;
                    var A, B, C, D, E;
                    var temp;

                    input = Utf8Encode(input);

                    var input_len = input.length;

                    var word_array = new Array();
                    for( i=0; i<input_len-3; i+=4 ) {
                        j = input.charCodeAt(i)<<24 | input.charCodeAt(i+1)<<16 |
                        input.charCodeAt(i+2)<<8 | input.charCodeAt(i+3);
                        word_array.push( j );
                    }

                    switch( input_len % 4 ) {
                        case 0:
                            i = 0x080000000;
                        break;
                        case 1:
                            i = input.charCodeAt(input_len-1)<<24 | 0x0800000;
                        break;

                        case 2:
                            i = input.charCodeAt(input_len-2)<<24 | input.charCodeAt(input_len-1)<<16 | 0x08000;
                        break;

                        case 3:
                            i = input.charCodeAt(input_len-3)<<24 | input.charCodeAt(input_len-2)<<16 | input.charCodeAt(input_len-1)<<8    | 0x80;
                        break;
                    }

                    word_array.push( i );

                    while( (word_array.length % 16) != 14 ) word_array.push( 0 );

                    word_array.push( input_len>>>29 );
                    word_array.push( (input_len<<3)&0x0ffffffff );


                    for ( blockstart=0; blockstart<word_array.length; blockstart+=16 ) {
                        for (i=0; i<16; i++) W[i] = word_array[blockstart+i];
                        for (i=16; i<=79; i++) W[i] = rotate_left(W[i-3] ^ W[i-8] ^ W[i-14] ^ W[i-16], 1);

                        A = H0;
                        B = H1;
                        C = H2;
                        D = H3;
                        E = H4;

                        for (i= 0; i<=19; i++) {
                            temp = (rotate_left(A,5) + ((B&C) | (~B&D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
                            E = D;
                            D = C;
                            C = rotate_left(B,30);
                            B = A;
                            A = temp;
                        }

                        for (i=20; i<=39; i++) {
                            temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
                            E = D;
                            D = C;
                            C = rotate_left(B,30);
                            B = A;
                            A = temp;
                        }

                        for (i=40; i<=59; i++) {
                            temp = (rotate_left(A,5) + ((B&C) | (B&D) | (C&D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
                            E = D;
                            D = C;
                            C = rotate_left(B,30);
                            B = A;
                            A = temp;
                        }

                        for (i=60; i<=79; i++) {
                            temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
                            E = D;
                            D = C;
                            C = rotate_left(B,30);
                            B = A;
                            A = temp;
                        }

                        H0 = (H0 + A) & 0x0ffffffff;
                        H1 = (H1 + B) & 0x0ffffffff;
                        H2 = (H2 + C) & 0x0ffffffff;
                        H3 = (H3 + D) & 0x0ffffffff;
                        H4 = (H4 + E) & 0x0ffffffff;
                    }

                    var temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);

                    return temp.toLowerCase();
                }
            };
        })
        .run(function ($window, $ionicPlatform, $ionicLoading, $rootScope, $http, $cordovaPush, $cordovaDialogs, $ionicPopup, $cordovaBadge) {
            $ionicPlatform.ready(function () {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs).
                if (window.cordova && window.cordova.plugins) {
                    if (window.cordova.plugins.Keyboard) {
                        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                    }
                }

                if (window.StatusBar) {
                    StatusBar.styleDefault();
                }

                if (ionic.Platform.isIOS()) {
                    var configPush = {
                        "badge": "true",
                        "sound": "true",
                        "alert": "true"
                    };
                } else if (ionic.Platform.isAndroid()) {
                    var configPush = {
                        "senderID": "825494278935"
                    };
                }

                document.addEventListener("deviceready", function(){
                    $cordovaPush.register(configPush).then(function(result) {
                        console.log('ready for notif');
                    }, function(e) {
                        console.log(e);
                    })
                });

                $rootScope.$on('$cordovaPush:notificationReceived', function(e, notification) {
                    switch(notification.event) {
                        case 'registered':
                            if (notification.regid.length > 0) {
                                localStorage.setItem('regid', notification.regid);
                                console.log('regid => ' + notification.regid);
                            } else {
                                console.log('regid NOK => ' + notification.regid);
                            }

                            break;
                        case 'message':
                            var title = 'ZeLift';
                            var type = 'simple';
                            var event = 'message';

                            if (notification.payload.title) {
                                title = notification.payload.title;
                            }

                            if (notification.payload.type) {
                                type = notification.payload.type;
                            }

                            if (notification.payload.event) {
                                event = notification.payload.event;
                            }

                            if (event == 'message') {
                                $cordovaBadge.hasPermission().then(function() {
                                    $cordovaBadge.get(function(currentCount) {
                                        $cordovaBadge.set(currentCount + 1);
                                    });
                                }, function() {
                                    console.log('not allowed to set badge.');
                                });

                                var media = new Media("http://www.zelift.com/assets/sounds/beep.wav", function () {
                                    console.log('media beep loaded');
                                }, function (e) {
                                    console.log(e.message);
                                });

                                media.play();

                                if (type == 'simple') {
                                    $cordovaDialogs.alert(notification.message, title);
                                } else if (type == 'rich') {
                                    $ionicPopup.alert({
                                        title: '<i class="fa fa-exclamation-triangle fa-3x zeliftColor"><i> ' + title,
                                        template: notification.message,
                                        buttons: [{
                                            text: 'OK',
                                            type: 'button button-full button-zelift'
                                        }]
                                    });
                                }
                            }

                            break;
                        default:
                            alert('An unknown GCM event has occurred');
                            break;
                    }
                });
            });

            $rootScope.ENV = 'development';

            $rootScope.conf = function () {
                this.get = function (key, cb, defaultVal) {
                    defaultVal = typeof(defaultVal) == 'undefined' ? null : defaultVal;

                    $http.get('js/data/config.json')
                    .success(function(res) {
                        var seg = res[$rootScope.ENV];
                        var tab = key.split('.');

                        for (var i = 0; i < tab.length; i++) {
                            seg = seg[tab[i]];
                        }

                        cb(seg);
                    });
                };

                return this;
            };

            $rootScope.conf().get('api.url', function (res) {
                $rootScope.apiUrl = res;
            });

            //*** Show loading indicator between page transitions - mostly for when deployed
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                $ionicLoading.show({
                    template: '<i class="icon ion-loading-b"></i>'
                });
            });

            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                $ionicLoading.hide();
            });

            $rootScope.$on('$stateNotFound', function(ev, unfoundState, fromState) {
                console.log("stateNotFound:");
                console.log(unfoundState);
                console.log(fromState);
            });

            $rootScope.show = function (text) {
                $rootScope.loading = $ionicLoading.show({
                    template: text ? text : 'Chargement...',
                    animation: 'fade-in',
                    showBackdrop: true,
                    maxWidth: 400,
                    showDelay: 0
                });
            };

            $rootScope.hide = function () {
                $ionicLoading.hide();
            };

            $rootScope.notify =function(text){
                $rootScope.show(text);
                $window.setTimeout(function () {
                    $rootScope.hide();
                }, 1999);
            };
        })

        .directive('toggleClass', ['$window', function(classe) {
            return {
                restrict: 'A',

                link: function(scope, element, attr) {
                    if (scope.isMenuLeftOpened === false) {
                        console.log('fd');
                    }
                }
            };
        }])

        .config(['$httpProvider', function ($httpProvider) {
            $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        }])
})();

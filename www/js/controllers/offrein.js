(function () {
    'use strict';

    angular.module('zelift').controller('offrein', offreinController);

    function offreinController($ionicModal, $ionicPopup, $http, $rootScope, $window, $scope, $filter, $state, utils, store, $stateParams, $timeout, $log, global, $cordovaDialogs, $location, memo) {

        global.setScope($scope);

        var store = memo.init();

        $scope.getItemUrl = function (item) {
            return item.is_item != 1 ? '#/zelift/children/' + item.id : '#/zelift/offrein/' + item.id;
        };

        var segmentId = $stateParams.segmentId;

        $scope.store().set('last.location', '#/zelift/offrein/' + segmentId);

        $ionicModal.fromTemplateUrl('templates/addaddress.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.registerModalAddress = modal;
        });

        $scope.closeAddAddress = function() {
            $scope.registerModalAddress.hide();
        };

        $scope.addAddress = function() {
            $scope.registerModalAddress.show();
        };

        $scope.addaddressData = {
            'account_id' : $scope.user.id,
            'token' : $scope.user.token,
            'country':'France'
        };

        function addZero(i)
        {
            return i < 10 ? '0' + i : '' + i;
        }

        var d = new Date;

        var hour = d.getHours();
        var m = addZero(d.getMinutes());

        var min = parseInt(m);

        var h = min > 52 ? addZero(parseInt(hour + 3)) : addZero(parseInt(hour + 2));

        if (h == '24') {
            h = '00';
        } else if (h == '25') {
            h = '01';
        }

        if (m == '00' || m == '01' || m == '02' || m == '03' || m == '04' || m == '05' ||  m == '06' || m == '07' || m == '53' || m == '54' || m == '55' || m == '56' || m == '57' || m == '58' || m == '59') {
            m = '00';
        } else if (m == '08' || m == '09' || m == '10' || m == '11' || m == '12' || m == '13' ||  m == '14' || m == '15' || m == '16' || m == '17' ||  m == '18' || m == '19' || m == '20' || m == '21' || m == '22') {
            m = '15';
        } else if (m == '23' || m == '24' || m == '25' || m == '26' || m == '27' || m == '28' ||  m == '29' || m == '30' || m == '31' || m == '32' ||  m == '33' || m == '34' || m == '35' || m == '36' || m == '37') {
            m = '30';
        } else {
            m = '45';
        }

        $scope.dataOffreinform = {
            'sellzone_id' : $scope.user.sellzone_id,
            'account_id' : $scope.user.id,
            'segment_id' : segmentId,
            'time_minutes' : m,
            'time_hours' : h,
            'token' : $scope.user.token,
            'distance_max' : 0,
            'langue' : 'non'
        };

        console.log($scope.dataOffreinform.time_hours);

        $scope.qty = 0;
        $scope.qkv = [];

        $scope.minutes = ['00', '15', '30', '45'];
        $scope.hours = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];

        $scope.changeListQuantified = function (form) {
            var ind = parseInt(form.ql.$viewValue);

            for (var i = 0; i < $scope.offreinform.list_quantified_values.length; i++) {
                var v = $scope.offreinform.list_quantified_values[i];

                if (v.id == ind) {
                    $scope.qkv[v.id] = true;
                } else {
                    $scope.dataOffreinform['quantity_' + v.id] = '';
                    $scope.qkv[v.id] = false;
                }
            }
        }

        $scope.doOffreIn = function (form) {
            if (form.$valid) {
                $http.post($rootScope.apiUrl + 'offreinsubmit', $scope.dataOffreinform)
                .success(function(data) {
                    switch (data.status) {
                        case 200:
                            data.results.title = $scope.viewTitle;
                            $scope.addRemember('offresout.services', data.results);
                            $scope.go('zelift.offreout', {});
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
                    $log.log($rootScope.apiUrl + 'offreinsubmit');
                    $log.log(status);
                });
            } else {
                $ionicPopup.alert({
                    title: '<i class="fa fa-exclamation-triangle fa-3x zeliftColor"><i>',
                    template: "Merci de corriger ou compléter le formulaire",
                    buttons: [{
                        text: 'OK',
                        type: 'button button-full button-zelift'
                    }]
                });
            }
        };

        $scope.doAddAddress = function (form) {
            var errorMessage = [];

            if (form.$valid) {
                var error = false;

                if (form.name.$viewValue.length < 3) {
                    errorMessage.push("Le nom de votre adresse doit comporter au moins 3 caractères");
                    error = true;
                }

                if (!form.receipt_name.$viewValue.match(' ')) {
                    errorMessage.push("Indiquer un nom et un prénom dans le champ destinataire");
                    error = true;
                }

                if (form.address.$viewValue.length < 3) {
                    errorMessage.push("L'adresse est incorrecte");
                    error = true;
                }

                if (form.zip.$viewValue.length != 5) {
                    errorMessage.push("Le code postal est incorrect");
                    error = true;
                }

                if (form.city.$viewValue.length < 3) {
                    errorMessage.push("La ville est incorrecte");
                    error = true;
                }

                if (form.country.$viewValue.length < 3) {
                    errorMessage.push("Le pays est incorrect");
                    error = true;
                }

                if (error) {
                    $ionicPopup.alert({
                        title: '<i class="fa fa-exclamation-triangle fa-3x zeliftColor"><i>',
                        template: errorMessage.join('<br>'),
                        buttons: [{
                            text: 'OK',
                            type: 'button button-full button-zelift'
                        }]
                    });
                } else {
                    $http.post($rootScope.apiUrl + 'addaddress', $scope.addaddressData)
                    .success(function(data) {
                        switch (data.status) {
                            case 200:
                                var exists = false;

                                for (var i = 0; i < $scope.addresses.length; i++) {
                                    var ad = $scope.addresses[i];

                                    if (ad.id == data.results.id) {
                                        exists = true;
                                        break;
                                    }
                                }

                                if (!exists) {
                                    $scope.addresses.push(data.results);
                                    $scope.dataOffreinform.address_id = $scope.addresses[$scope.addresses.length - 1].id;
                                } else {
                                    console.log('adresse doublon');
                                    $scope.dataOffreinform.address_id = data.results.id;
                                }

                                $scope.closeAddAddress();
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
                        $log.log($rootScope.apiUrl + 'addaddress');
                        $log.log(status);
                    });
                }
            } else {
                if (form.name.$error.required) {
                    errorMessage.push("Nommer votre adresse");
                }

                if (form.receipt_name.$error.required) {
                    errorMessage.push("Ajouter un destinataire");
                }

                if (form.address.$error.required) {
                    errorMessage.push("Ajouter une adresse");
                }

                if (form.zip.$error.required) {
                    errorMessage.push("Ajouter un code postal");
                }

                if (form.city.$error.required) {
                    errorMessage.push("Ajouter une ville");
                }

                if (form.country.$error.required) {
                    errorMessage.push("Ajouter un pays");
                }

                $ionicPopup.alert({
                    title: '<i class="fa fa-exclamation-triangle fa-3x zeliftColor"><i>',
                    template: errorMessage.join('<br>'),
                    buttons: [{
                        text: 'OK',
                        type: 'button button-full button-zelift'
                    }]
                });
            }
        };

        $scope.quantityMultiple = function (id) {
            return $scope.dataOffreinform['quantity_' + id];
        };

        function init()
        {
            var dataOffreIn = {
                'account_id' : $scope.user.id,
                'token' : $scope.user.token,
                'id' : segmentId
            };

            var cache = store.get('offreinforms.' + segmentId);

            if (cache) {
                displayOffer(cache);
            } else {
                $scope.remember('offreinforms.' + segmentId, function () {
                    $http.post($rootScope.apiUrl + 'offreinform', dataOffreIn)
                    .success(function(data) {
                        switch (data.status) {
                            case 200:
                                $timeout(function() {
                                    $scope.addRemember('offreinforms.' + segmentId, data.results);
                                    store.set('offreinforms.' + segmentId, data.results);
                                    displayOffer(data.results);
                                }, 300);

                                break;
                            case 500:
                                $cordovaDialogs.alert(data.message, 'information');
                                $scope.go('zelift.home');

                                break;
                        }
                    })
                    .error(function (data, status) {
                        $log.log($rootScope.apiUrl + 'children');
                        $log.log(status);
                    });
                }, function (res) {
                    store.set('offreinforms.' + segmentId, res);
                    displayOffer(res);
                });
            }
        }

        function displayOffer(data) {
            $scope.viewTitle = data.title;
            $scope.addresses = data.addresses;

            if ($scope.addresses.length > 0) {
                $scope.dataOffreinform.address_id = data.addresses[0].id;
            }

            $scope.offreinform = data.form;

            $scope.showQuantity = false;

            if (data.form.quantity) {
                if (data.form.quantity.label) {
                    $scope.showQuantity = data.form.quantity.label.length > 0;
                }

                if ($scope.offreinform.quantity.opts.price.length > 0) {
                    for (var i = 0; i < $scope.offreinform.quantity.opts.price.length; i++) {
                        var opt = $scope.offreinform.quantity.opts.price[i];

                        if (opt.content.type == 'oui_non') {
                            $scope.dataOffreinform['option_price_' + opt.name] = opt.content.default == 'non' ? false : true;
                        }
                    }
                }

                if (data.form.quantity.type == 'min_max') {
                    $scope.dataOffreinform.quantity = data.form.quantity.min;
                }

                if (data.form.quantity.type == 'list_quantified') {
                    $scope.dataOffreinform.ql = 1;
                }

                if (data.form.quantity.type == 'int') {
                    $scope.dataOffreinform.quantity = parseInt(data.form.quantity.default);
                }
            }
        }

        init();
    }
})();

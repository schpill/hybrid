(function () {
    'use strict';

    angular.module('zelift').controller('offrein', offreinController);

    function offreinController($ionicModal, $ionicPopup, $http, $rootScope, $window, $scope, $filter, $state, utils, store, $stateParams, $timeout, $log, $cordovaDatePicker) {
        $scope.getItemUrl = function (item) {
            return item.is_item != 1 ? '#/zelift/children/' + item.id : '#/zelift/offrein/' + item.id;
        };

        var segmentId = $stateParams.segmentId;

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

        $scope.dataOffreinform = {
            'sellzone_id' : $scope.user.sellzone_id,
            'account_id' : $scope.user.id,
            'segment_id' : segmentId,
            'token' : $scope.user.token,
            'distance_max' : 0,
            'langue' : 'non'
        };

        $scope.qty = 0;
        $scope.qkv = [];

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

            $scope.remember('offreinform.' + segmentId, function () {
                $http.post($rootScope.apiUrl + 'offreinform', dataOffreIn)
                .success(function(data) {
                    switch (data.status) {
                        case 200:
                            $timeout(function() {
                                $scope.addRemember('offreinform.' + segmentId, data.results);
                                $scope.viewTitle = data.results.title;
                                $scope.addresses = data.results.addresses;

                                if ($scope.addresses.length > 0) {
                                    $scope.dataOffreinform.address_id = data.results.addresses[0].id;
                                }

                                $scope.offreinform = data.results.form;

                                $scope.showQuantity = false;

                                if (data.results.form.quantity) {
                                    if (data.results.form.quantity.label) {
                                        $scope.showQuantity = data.results.form.quantity.label.length > 0;
                                    }

                                    if ($scope.offreinform.quantity.opts.price.length > 0) {
                                        for (var i = 0; i < $scope.offreinform.quantity.opts.price.length; i++) {
                                            var opt = $scope.offreinform.quantity.opts.price[i];

                                            if (opt.content.type == 'oui_non') {
                                                $scope.dataOffreinform['option_price_' + opt.name] = opt.content.default == 'non' ? false : true;
                                            }
                                        }
                                    }

                                    if (data.results.form.quantity.type == 'min_max') {
                                        $scope.dataOffreinform.quantity = data.results.form.quantity.min;
                                    }

                                    if (data.results.form.quantity.type == 'list_quantified') {
                                        $scope.dataOffreinform.ql = 1;
                                    }

                                    if (data.results.form.quantity.type == 'int') {
                                        $scope.dataOffreinform.quantity = parseInt(data.results.form.quantity.default);
                                    }
                                }
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
                    $log.log($rootScope.apiUrl + 'children');
                    $log.log(status);
                });
            }, function (res) {
                $scope.viewTitle = res.title;
                $scope.addresses = res.addresses;

                if ($scope.addresses.length > 0) {
                    $scope.dataOffreinform.address_id = res.addresses[0].id;
                }

                $scope.offreinform = res.form;

                $scope.showQuantity = false;

                if (res.form.quantity) {
                    if (res.form.quantity.label) {
                        $scope.showQuantity = res.form.quantity.label.length > 0;
                    }


                    if ($scope.offreinform.quantity.opts.price.length > 0) {
                        for (var i = 0; i < $scope.offreinform.quantity.opts.price.length; i++) {
                            var opt = $scope.offreinform.quantity.opts.price[i];

                            if (opt.content.type == 'oui_non') {
                                $scope.dataOffreinform['option_price_' + opt.name] = opt.content.default == 'non' ? false : true;
                            }
                        }
                    }

                    if (res.form.quantity.type == 'min_max') {
                        $scope.dataOffreinform.quantity = res.form.quantity.min;
                    }

                    if (res.form.quantity.type == 'list_quantified') {
                        $scope.dataOffreinform.ql = 1;
                    }

                    if (res.form.quantity.type == 'int') {
                        $scope.dataOffreinform.quantity = parseInt(res.form.quantity.default);
                    }
                }
            });
        }

        init();
    }
})();

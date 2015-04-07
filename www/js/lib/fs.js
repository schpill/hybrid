(function () {
    'use strict';

    function failFS(error) {
        console.log(error.code);
    }

    function successFS(ev) {
        console.log('OK success');
    }

    angular.module('zelift').factory('fs', function ($q, $ionicPlatform) {
        var self = this;

        self.init = function () {
            return self;
        };

        self.set = function (key, value) {
            self.delWrite(key, value, function (k, v) {
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
                    fileSystem.root.getFile(k.split('.').join('_') + '.key', {create: true, exclusive: false}, function(entry) {
                        entry.createWriter(function(writer) {
                            writer.write(JSON.stringify(v));
                        }, function() {
                            console.log('no key');
                        });
                    }, function () {
                        console.log('no setFile');
                    });
                }, failFS);
            });
        };

        self.get = function (key, cb, defaultVal) {
            defaultVal = typeof(defaultVal) == 'undefined' ? null : defaultVal;

            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
                fileSystem.root.getFile(key.split('.').join('_') + '.key', {create: false, exclusive: false}, function(entry) {
                    entry.file(function (file) {
                        var reader = new FileReader();

                        reader.onloadend = function(event) {
                            console.log('get it ' + key);
                            cb(JSON.parse(event.target.result));
                        };

                        reader.readAsText(file);
                    }, function () {
                        cb(defaultVal);
                    });
                }, function () {
                    console.log('no getFile ' + key.split('.').join('_') + '.key');
                    console.log(defaultVal);
                    cb(defaultVal);
                });
            }, failFS);
        };

        self.del = function (key) {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
                fileSystem.root.getFile(key.split('.').join('_') + '.key', {create: false, exclusive: false}, function(entry) {
                    entry.remove();
                    console.log('delete ' + key);
                }, function () {
                    console.log('no delFile');
                });
            }, failFS);
        };

        self.delWrite = function (key, value, cb) {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
                fileSystem.root.getFile(key.split('.').join('_') + '.key', {create: false, exclusive: false}, function(entry) {
                    entry.remove();
                    console.log('delete ' + key);
                    cb(key, value);
                }, function () {
                    console.log('no delWriteFile');
                    cb(key, value);
                });
            }, failFS);
        };

        self.removeRemember = function () {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
                var directoryReader = fileSystem.root.createReader();
                directoryReader.readEntries(function (entries) {
                    var i;

                    for (i = 0; i < entries.length; i++) {
                        var entry = entries[i];

                        if (entry.name.match('remember_')) {
                            entry.remove();
                            console.log('delete ' + entry.name);
                        }
                    }
                }, function () {
                    console.log('no directoryReader');
                });
            }, failFS);
        };

        return self;
    });
})();

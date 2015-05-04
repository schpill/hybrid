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

        self.db = {};
        self.db.wheres = {};

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

        self.keys = function (pattern, cb) {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
                var directoryReader = fileSystem.root.createReader();
                directoryReader.readEntries(function (entries) {
                    var i;
                    var collection = [];

                    pattern = pattern.split('.').join('_');

                    for (i = 0; i < entries.length; i++) {
                        var entry = entries[i];

                        if (entry.name.match(pattern)) {
                            collection.push(entry.name.split(".key").join('').split('_').join('.'));
                            console.log('push collection ' + entry.name.split(".key").join('').split('_').join('.'));
                        }
                    }

                    cb(collection);
                }, function () {
                    console.log('no directoryReader');
                });
            }, failFS);
        };

        self.incr = function (key, cb, by) {
            by = typeof(by) == 'undefined' ? 1 : by;
            var keyIncr = 'incr.' + key;

            self.get(keyIncr, function (res) {
                var num = parseInt(res);
                num += by;

                self.set(keyIncr, num);

                cb(num);
            }, 0);
        };

        self.decr = function (key, cb, by) {
            by = typeof(by) == 'undefined' ? 1 : by;
            var keyIncr = 'decr.' + key;

            self.get(keyIncr, function (res) {
                var num = parseInt(res);
                num -= by;

                self.set(keyIncr, num);

                cb(num);
            }, 0);
        };

        self.db.find = function (table, id, cb) {
            var key = 'db.' + table + '.' + id;

            self.get(key, function (row) {
                cb(self.db.model(row));
            }, {});
        };

        self.db.findorFail = function (table, id, cb) {
            var key = 'db.' + table + '.' + id;

            self.get(key, function (row) {
                if (row.id) {
                    cb(self.db.model(row));
                } else {
                    cb(false);
                }
            }, {});
        };

        self.db.all = function (table, cb) {
            var collection = [];

            self.keys('db.' + table, function (rows) {
                if (rows.length > 0) {
                    for (var i = 0; i < rows.length; i++) {
                        var row = rows[i];
                        collection.push(self.db.model(row));
                    }
                }

                cb(collection);
            });
        };

        self.db.reset = function (table) {
            self.db.wheres[table] = [];
        };

        self.db.where = function (table, cond, op) {
            op = typeof(op) == 'undefined' ? 'AND' : op;

            if (!self.db.wheres[table]) {
                self.db.wheres[table] = {};
            }

            if (!self.db.wheres[table][op]) {
                self.db.wheres[table][op] = [];
            }

            self.db.wheres[table][op].push(cond);

            return self.db;
        };

        self.db.get = function (table, cb) {
            self.db.all(table, function (rows) {
                if (self.db.wheres[table]['AND'].length > 0 && rows.length > 0) {
                    for (var i = 0; i < self.db.wheres[table]['AND'].length; i++) {
                        var cond = self.db.wheres[table]['AND'][i];

                        var field   = cond[0];
                        var checkOp = cond[1];
                        var val     = cond[2];
                    }
                }
            });
        };

        self.db.check = function (val, valCmp, checkOp) {
            switch (checkOp) {
                case '=':
                    return val == valCmp;
                case '<=':
                    return val <= valCmp;
                case '>=':
                    return val >= valCmp;
                case '<>':
                case '!=':
                    return val != valCmp;
                case '!==':
                    return val !== valCmp;
                case '===':
                    return val === valCmp;
                case 'LIKE':
                    return val.match(valCmp);
                case 'NOT LIKE':
                    return !val.match(valCmp);
            }

            return false;
        };

        self.db.makeId = function (table, cb) {
            self.incr(table, function (num) {
                cb(num);
            });
        };

        self.db.create = function (table, data) {
            data = typeof(data) == 'undefined' ? {} : data;

            return self.db.model(table, data);
        };

        self.db.model = function (data) {
            data = typeof(data) == 'undefined' ? {} : data;

            return function () {
                var row = {
                    'delete':remove,
                    save:save,
                    edit:edit,
                    add:add
                };

                return row;

                function save(cb) {
                    if (data.id) {
                        row.edit(cb);
                    } else {
                        row.add(cb);
                    }
                }

                function edit(cb) {
                    var key = 'db.' + table + '.' + data.id;
                    data.updated_at = Math.floor(Date.now() / 1000);
                    self.set(key, data);
                    cb(data);
                }

                function add(cb) {
                    self.db.makeId('db.' + table, function (id) {
                        var now = Math.floor(Date.now() / 1000);
                        data.id = id;

                        var key = 'db.' + table + '.' + data.id;

                        data.created_at = now;
                        data.updated_at = now;
                        self.set(key, data);
                        cb(data);
                    });
                }

                function remove(cb) {
                    if (data.id) {
                        var key = 'db.' + table + '.' + data.id;
                        self.del(key);
                        cb(true);
                    } else {
                        cb(false);
                    }
                };
            };
        };

        return self;
    });
})();

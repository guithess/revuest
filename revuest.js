"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
function parseValue(value) {
    try {
        return JSON.parse(value);
    } catch (e) {
        return value;
    }
}

function loadFromStorage(storageType) {
    var data = {};
    for (var i = 0, len = window[storageType].length; i < len; ++i) {
        var key = window[storageType].key(i);
        var val = parseValue(window[storageType].getItem(key));
        data[key] = val;
    }
    return data;
}

function saveToStorage(storageType, storageObj) {
    for (var i = 0, keys = Object.keys(storageObj), len = keys.length; i < len; i++) {
        window[storageType].setItem(keys[i], JSON.stringify(storageObj[keys[i]]));
    }
}

function clearStorage(storageType) {
    window[storageType].clear();
}

function setWrapper(storageType, key, value) {
    window[storageType].setItem(key, JSON.stringify(value));
}

function delWrapper(storageType, key) {
    window[storageType].removeItem(key);
}

function getWrapper(storageType, key) {
    return parseValue(window[storageType].getItem(key));
}

var revuest = {
    install: function install(Vue, options) {
        Vue.mixin({
            data: function data() {
                return {
                    localStorage: {},
                    sessionStorage: {}
                };
            },
            beforeCreate: function beforeCreate() {
                var self = this;
                this.$localStorage = {
                    $clear: function $clear() {
                        clearStorage("localStorage");
                    },
                    $set: function $set(key, value) {
                        setWrapper("localStorage", key, value);
                    },
                    $del: function $del(key) {
                        delWrapper("localStorage", key, value);
                    },
                    $get: function $get(key) {
                        return getWrapper("localStorage", key);
                    },
                    $refresh: function $refresh() {
                        var storedObj = loadFromStorage("localStorage");
                        for (var i = 0, keys = Object.keys(self.localStorage), len = keys.length; i < len; i++) {
                            self.$delete(self.localStorage, keys[i]);
                        }
                        for (var _i = 0, _keys = Object.keys(storedObj), _len = _keys.length; _i < _len; _i++) {
                            self.$set(self.localStorage, _keys[_i], storedObj[_keys[_i]]);
                        }
                    },
                    $default: function $default(obj) {
                        var newObj = Object.assign({}, obj, loadFromStorage("localStorage"));
                        saveToStorage("localStorage", newObj);
                    }
                };
                this.$sessionStorage = {
                    $clear: function $clear() {
                        clearStorage("sessionStorage");
                    },
                    $set: function $set(key, value) {
                        setWrapper("sessionStorage", key, value);
                    },
                    $del: function $del(key) {
                        delWrapper("sessionStorage", key, value);
                    },
                    $get: function $get(key) {
                        return getWrapper("sessionStorage", key);
                    },
                    $refresh: function $refresh() {
                        var storedObj = loadFromStorage("sessionStorage");
                        for (var i = 0, keys = Object.keys(self.sessionStorage), len = keys.length; i < len; i++) {
                            self.$delete(self.sessionStorage, keys[i]);
                        }
                        for (var _i2 = 0, _keys2 = Object.keys(storedObj), _len2 = _keys2.length; _i2 < _len2; _i2++) {
                            self.$set(self.sessionStorage, _keys2[_i2], storedObj[_keys2[_i2]]);
                        }
                    },
                    $default: function $default(obj) {
                        var newObj = Object.assign({}, obj, loadFromStorage("sessionStorage"));
                        console.log(newObj);
                        saveToStorage("sessionStorage", newObj);
                    }
                };
            },
            created: function created() {
                var _this = this;

                this.localStorage = loadFromStorage("localStorage"), this.sessionStorage = loadFromStorage("sessionStorage");

                window.addEventListener("storage", function (e) {
                    if (e.storageArea === window.localStorage) {
                        _this.$localStorage.$refresh();
                    } else if (e.storageArea === window.sessionStorage) {
                        _this.$sessionStorage.$refresh();
                    }
                });

                this.$watch(function () {
                    return this.localStorage;
                }, function () {
                    saveToStorage("sessionStorage", this.localStorage);
                }, {
                    deep: true
                });

                this.$watch(function () {
                    return this.sessionStorage;
                }, function () {
                    saveToStorage("sessionStorage", this.sessionStorage);
                }, {
                    deep: true
                });
            }
        });
    }
};

exports.default = revuest;

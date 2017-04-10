"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BROWSER = "BROWSER",
    NODE = "NODE";
var $$platform = (typeof process === "undefined" ? "undefined" : _typeof(process)) === 'object' && process + '' === '[object process]' ? NODE : BROWSER;

var Storage = function () {
    function Storage(instance, storageType) {
        _classCallCheck(this, Storage);

        this.instance = instance;
        this.storageType = storageType;

        this.$$defaults = {};
    }

    /*
     * Instance methods
     */


    _createClass(Storage, [{
        key: "$clear",
        value: function $clear() {
            if ($$platform === BROWSER) {
                window[this.storageType].clear();
            }
        }
    }, {
        key: "$get",
        value: function $get(key) {
            if ($$platform === BROWSER) {
                return Storage.parse(window[this.storageType].getItem(key));
            } else {
                return null;
            }
        }
    }, {
        key: "$set",
        value: function $set(key, value) {
            if ($$platform === BROWSER) {
                window[this.storageType].setItem(key, JSON.stringify(value));
            }
        }
    }, {
        key: "$del",
        value: function $del(key) {
            if ($$platform === BROWSER) {
                window[this.storageType].removeItem(key);
            }
        }
    }, {
        key: "$refresh",
        value: function $refresh() {
            Storage.unwatch(this.instance, this.storageType);

            var storedObj = Storage.load(this.storageType);
            for (var i = 0, keys = Object.keys(this.instance[this.storageType]), len = keys.length; i < len; i++) {
                this.instance.$delete(this.instance[this.storageType], keys[i]);
            }
            for (var _i = 0, _keys = Object.keys(storedObj), _len = _keys.length; _i < _len; _i++) {
                this.instance.$set(this.instance[this.storageType], _keys[_i], storedObj[_keys[_i]]);
            }

            Storage.watch(this.instance, this.storageType);
        }
    }, {
        key: "$default",
        value: function $default() {
            var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            this.$$defaults = obj;

            if ($$platform === BROWSER) {
                Storage.save(this.storageType, Object.assign({}, obj, Storage.load(this.storageType)));
            }
        }

        /*
         * Static methods
         */

    }], [{
        key: "parse",
        value: function parse(val) {
            try {
                return JSON.parse(val);
            } catch (e) {
                return val;
            }
        }
    }, {
        key: "load",
        value: function load(storageType) {
            var data = {};
            for (var i = 0, len = window[storageType].length; i < len; ++i) {
                var key = window[storageType].key(i);
                var val = Storage.parse(window[storageType].getItem(key));
                data[key] = val;
            }
            return data;
        }
    }, {
        key: "save",
        value: function save(storageType, storageObj) {
            for (var i = 0, keys = Object.keys(storageObj), len = keys.length; i < len; i++) {
                window[storageType].setItem(keys[i], JSON.stringify(storageObj[keys[i]]));
            }

            var event = document.createEvent("StorageEvent");
            event.initStorageEvent("storage", false, false, null, null, null, null, window[storageType]);
            window.dispatchEvent(event);
        }
    }, {
        key: "watch",
        value: function watch(instance, storageType) {
            instance["$" + storageType].$$unwatch = instance.$watch(function () {
                return instance[storageType];
            }, function () {
                Storage.save(storageType, instance[storageType]);
            }, {
                deep: true
            });
        }
    }, {
        key: "unwatch",
        value: function unwatch(instance, storageType) {
            instance["$" + storageType].$$unwatch();
        }
    }]);

    return Storage;
}();

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
                this.$localStorage = new Storage(this, "localStorage");
                this.$sessionStorage = new Storage(this, "sessionStorage");
            },
            created: function created() {
                var _this = this;

                if ($$platform === BROWSER) {
                    this.localStorage = Storage.load("localStorage");
                    this.sessionStorage = Storage.load("sessionStorage");

                    window.addEventListener("storage", function (e) {
                        if (e.storageArea === window.localStorage) {
                            _this.$localStorage.$refresh();
                        } else if (e.storageArea === window.sessionStorage) {
                            _this.$sessionStorage.$refresh();
                        }
                    });

                    Storage.watch(this, "localStorage");
                    Storage.watch(this, "sessionStorage");
                } else {
                    this.localStorage = this.$localStorage.$$defaults;
                    this.sessionStorage = this.$sessionStorage.$$defaults;
                }
            }
        });
    }
};

exports.default = revuest;

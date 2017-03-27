function parseValue(value) {
    try {
        return JSON.parse(value);
    } catch (e) {
        return value;
    }
}

function loadFromStorage(storageType) {
    let data = {};
    for (let i = 0, len = window[storageType].length; i < len; ++i) {
        let key = window[storageType].key(i);
        let val = parseValue(window[storageType].getItem(key));
        data[key] = val;
    }
    return data;
}

function saveToStorage(storageType, storageObj) {
    for (let i = 0, keys = Object.keys(storageObj), len = keys.length; i < len; i++) {
        window[storageType].setItem(keys[i], JSON.stringify(storageObj[keys[i]]));
    }

    window.dispatchEvent(new Event("revuest:save"));
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

function createWatcher(self, storageType) {
    self[`$${storageType}`].$$unwatch = self.$watch(function() {
        return self[storageType];
    }, function() {
        saveToStorage(storageType, self[storageType]);
    }, {
        deep: true
    });
}

const revuest = {
    install(Vue, options) {
        Vue.mixin({
            data() {
                return {
                    localStorage: {},
                    sessionStorage: {}
                }
            },
            beforeCreate() {
                let self = this;
                this.$localStorage = {
                    $clear() {
                        clearStorage("localStorage");
                    },
                    $set(key, value) {
                        setWrapper("localStorage", key, value);
                    },
                    $del(key) {
                        delWrapper("localStorage", key, value);
                    },
                    $get(key) {
                        return getWrapper("localStorage", key);
                    },
                    $refresh() {
                        self.$localStorage.$$unwatch();

                        let storedObj = loadFromStorage("localStorage");
                        for (let i = 0, keys = Object.keys(self.localStorage), len = keys.length; i < len; i++) {
                            self.$delete(self.localStorage, keys[i]);
                        }
                        for (let i = 0, keys = Object.keys(storedObj), len = keys.length; i < len; i++) {
                            self.$set(self.localStorage, keys[i], storedObj[keys[i]]);
                        }

                        createWatcher(self, "localStorage");
                    },
                    $default(obj) {
                        let newObj = Object.assign({}, obj, loadFromStorage("localStorage"));
                        saveToStorage("localStorage", newObj);
                    }
                };
                this.$sessionStorage = {
                    $clear() {
                        clearStorage("sessionStorage");
                    },
                    $set(key, value) {
                        setWrapper("sessionStorage", key, value);
                    },
                    $del(key) {
                        delWrapper("sessionStorage", key, value);
                    },
                    $get(key) {
                        return getWrapper("sessionStorage", key);
                    },
                    $refresh() {
                        self.$sessionStorage.$$unwatch();

                        let storedObj = loadFromStorage("sessionStorage");
                        for (let i = 0, keys = Object.keys(self.sessionStorage), len = keys.length; i < len; i++) {
                            self.$delete(self.sessionStorage, keys[i]);
                        }
                        for (let i = 0, keys = Object.keys(storedObj), len = keys.length; i < len; i++) {
                            self.$set(self.sessionStorage, keys[i], storedObj[keys[i]]);
                        }

                        createWatcher(self, "sessionStorage");
                    },
                    $default(obj) {
                        let newObj = Object.assign({}, obj, loadFromStorage("sessionStorage"));
                        saveToStorage("sessionStorage", newObj);
                    }
                };
            },
            created() {
                this.localStorage = loadFromStorage("localStorage");
                this.sessionStorage = loadFromStorage("sessionStorage");

                window.addEventListener("storage", (e) => {
                    if (e.storageArea === window.localStorage) {
                        this.$localStorage.$refresh();
                    } else if (e.storageArea === window.sessionStorage) {
                        this.$sessionStorage.$refresh();
                    }
                });

                window.addEventListener("revuest:save", (e) => {
                    this.$localStorage.$refresh();
                    this.$sessionStorage.$refresh();
                });

                createWatcher(this, "localStorage");
                createWatcher(this, "sessionStorage");
            }
        });
    }
};

export default revuest;

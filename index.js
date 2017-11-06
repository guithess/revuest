const BROWSER = "BROWSER", NODE = "NODE";
const $$platform = (typeof process === 'object' && process + '' === '[object process]' && !(process.versions.electron || process.versions.nwjs || process.versions['node-webkit'])) ? NODE : BROWSER;

class Storage {
    constructor(instance, storageType) {
        this.instance = instance;
        this.storageType = storageType;

        this.$$defaults = {};
    }

    /*
     * Instance methods
     */
    $clear() {
        if ($$platform === BROWSER) {
            window[this.storageType].clear();
        }
    }

    $get(key) {
        if ($$platform === BROWSER) {
            return Storage.parse(window[this.storageType].getItem(key));
        } else {
            return null
        }
    }

    $set(key, value) {
        if ($$platform === BROWSER) {
            window[this.storageType].setItem(key, JSON.stringify(value));
        }
    }

    $del(key) {
        if ($$platform === BROWSER) {
            window[this.storageType].removeItem(key);
        }
    }

    $refresh() {
        Storage.unwatch(this.instance, this.storageType);

        let storedObj = Storage.load(this.storageType);
        for (let i = 0, keys = Object.keys(this.instance[this.storageType]), len = keys.length; i < len; i++) {
            this.instance.$delete(this.instance[this.storageType], keys[i]);
        }
        for (let i = 0, keys = Object.keys(storedObj), len = keys.length; i < len; i++) {
            this.instance.$set(this.instance[this.storageType], keys[i], storedObj[keys[i]]);
        }

        Storage.watch(this.instance, this.storageType);
    }

    $default(obj = {}) {
        this.$$defaults = obj;

        if ($$platform === BROWSER) {
            Storage.save(this.storageType, Object.assign({}, obj, Storage.load(this.storageType)));
        }
    }

    /*
     * Static methods
     */
    static parse(val) {
        try {
            return JSON.parse(val);
        } catch (e) {
            return val;
        }
    }

    static load(storageType) {
        let data = {};
        for (let i = 0, len = window[storageType].length; i < len; ++i) {
            let key = window[storageType].key(i);
            let val = Storage.parse(window[storageType].getItem(key));
            data[key] = val;
        }
        return data;
    }

    static save(storageType, storageObj) {
        for (let i = 0, keys = Object.keys(storageObj), len = keys.length; i < len; i++) {
            window[storageType].setItem(keys[i], JSON.stringify(storageObj[keys[i]]));
        }

        let event = document.createEvent("StorageEvent");
        event.initStorageEvent("storage", false, false, null, null, null, null, window[storageType]);
        window.dispatchEvent(event);
    }

    static watch(instance, storageType) {
        instance[`$${storageType}`].$$unwatch = instance.$watch(() => { return instance[storageType]; }, () => {
            Storage.save(storageType, instance[storageType]);
        }, {
            deep: true
        });
    }

    static unwatch(instance, storageType) {
        instance[`$${storageType}`].$$unwatch();
    }
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
                this.$localStorage = new Storage(this, "localStorage");
                this.$sessionStorage = new Storage(this, "sessionStorage");
            },
            created() {
                if ($$platform === BROWSER) {
                    this.localStorage = Storage.load("localStorage");
                    this.sessionStorage = Storage.load("sessionStorage");

                    window.addEventListener("storage", this.$$refreshStorageContent);

                    Storage.watch(this, "localStorage");
                    Storage.watch(this, "sessionStorage");
                } else {
                    this.localStorage = this.$localStorage.$$defaults;
                    this.sessionStorage = this.$sessionStorage.$$defaults;
                }
            },
            beforeDestroy() {
                if ($$platform === BROWSER) {
                    window.removeEventListener("storage", this.$$refreshStorageContent);
                }
            },
            methods: {
                $$refreshStorageContent(e) {
                    if (e.storageArea === window.localStorage) return this.$localStorage.$refresh();
                    if (e.storageArea === window.sessionStorage) return this.$sessionStorage.$refresh();
                }
            }
        });
    }
};

export default revuest;

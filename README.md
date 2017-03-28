# Revuest

Revuest stands for Reactive Vue Storage. It provides reactive access to browser's storage objects (sessionStorage and localStorage).


### Quickstart

###### Installation
```shell
$ npm install revuest
```

###### Basic Usage

```javascript
// main.js

import Vue from "vue";
import App from "App.vue";
import revuest from "revuest";

Vue.use(revuest);

new Vue({
    el: "#app",
    render: h => h(App)
});
```

```html
<!-- App.vue -->

<template>
    <div>
        <h1>{{ localStorage.message }}</h1>
    </div>
</template>
```

### How it Works
Revuest uses [Vue.mixin](https://vuejs.org/v2/guide/mixins.html) method to inject four properties to every instance of Vue: the __localStorage__ and __sessionStorage__, that are used for accessing the stored key-value pairs, and the __$localStorage__ and __$sessionStorage__, that exposes wrappers to the browser's native storage objects functions get, set, delete, clear and other functions.

As long as the key-value pairs exist on the browser storage, they can be accessed from within templates like any other properties.

The plugin also uses the [Vue.watch](https://vuejs.org/v2/api/#watch) function and the browser's native [storage event](https://developer.mozilla.org/en-US/docs/Web/API/StorageEvent) to make the localStorage and sessionStorage objects reactive, which means that when the value is changed in one side, the data will be reflected on the other side.

That means it can be used inside inputs and other html elements like bellow:

```html
<template>
    <div>
        <input type="text" v-model="localStorage.message" />
    </div>
</template>
```

But note that due to Vue.watch limitation to watch for new properties, the code above only works if the data is already set on the storage before the Vue instance get created.

In order to solve that, use the [**beforeCreate**](https://vuejs.org/v2/guide/instance.html#Lifecycle-Diagram) hook to initialize the storage like the example bellow:

```html
<script>
export default {
    beforeCreate() {
        this.$localStorage.$default({
            message: "my message"
        });
    }
}
</script>
```

By doing so, the default values will be saved to the browser storage before Revuest initialization. Revuest uses the [Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) function to merge the defaults with the storaged data so that any existing values do not be overwritten.

### SSR - Server Side Rendering

Starting on version 1.1.0, **revuest** works fine with SSR.

**$localStorage.$default()** and **$sessionStorage.$default()** functions must be used to initialize the data, otherwise an empty object will be assigned to the localStorage and sessionStorage objects. The data can be referenced on the template the same way as in the client side rendering.

_**Note:** By the time that the client side takes over, the default values will be reevaluated and if the data stored on the browser is different from the default values used by the server, localStorage and sessionStorage objects will be automatically updated to reflect the browser values, the same way it happens when $default() is used directly on the client side. If the data does not exist on the browser storage **it will be automatically saved to storage at this time**._


### License
[MIT](LICENSE.md)

import Vue from 'vue';

// Initialise a Vue application
function initVueApp(app, el, props)
{
    // console.log(app);
    // Mount the root as a component so that Hot Module Replacement works (https://github.com/vuejs/vueify/issues/25)
    // Also use this in normal rendering to avoid attaching 'el' and 'propsData' directly to the component, which can
    // break if a component is used directly *and* also as a sub-component
    new Vue({
        el: el,
        functional: true, // Cheaper to render
        components: { app },
        render: createElement => createElement('app', { props }),
    });
};

// Lazy-load Vue components and applications from separate chunks
let requireVue = require.context('bundle-loader!../vue/', true, /\.vue$/);

// Register components
requireVue.keys().forEach(file =>
{
    // "./sample/vue-component.vue" -> "sample-vue-component"
    let name = file.substring(2, file.length - 4).replace(/\//g, '-');

    // Async loader function - https://vuejs.org/v2/guide/components.html#Async-Components
    Vue.component(name, function (resolve, reject)
    {
        requireVue(file)(resolve);
    });
});

// Initialise applications
// <div data-vue="dir/app-name" data-vue-props="{{ json_encode(['prop1' => $value, ...]) }}">Placeholder</div>
// <?= vue('dir/app-name', ['prop1' => $value, ...], 'Placeholder')
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[data-vue]').forEach(el => {
        let name = el.getAttribute('data-vue');
        let props = el.getAttribute('data-vue-props');

        if (Vue.options.components[name]) {
            initVueApp(Vue.options.components[name], el,props ? JSON.parse(props) : {});
        } else {
            console.warn(`Unable to find vue component '${name}', are you sure it has been loaded`);
        }
    });
});

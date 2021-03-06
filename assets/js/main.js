// Babel Polyfill - Must be at the top of the entry file
// This is for the case where ES2015 methods are being used in a file such as Array.prototype.find, Promise, async/await etc
// Make sure to run yarn add --dev babel-polyfill before importing it
// If you need to import only a part of it, follow https://github.com/zloirock/core-js#commonjs
// import 'babel-polyfill';

// Script runners
// import './main/runners';

// Vue applications
// import './main/vue';

import FieldRelationshipSingle from './vue/field/relationship-single';
import FieldRelationshipMany from './vue/field/relationship-many';
import FieldModelLookup from './vue/field/model-lookup';

Vue.component('field-relationship-single', FieldRelationshipSingle);
Vue.component('field-relationship-many', FieldRelationshipMany);
Vue.component('field-model-lookup', FieldModelLookup);
// Force apps/components/scripts that are used on every page to be in the main JS file not an async chunk so they load quicker
// require.include('./vue/example.vue');
// require.include('./runners/example.js');

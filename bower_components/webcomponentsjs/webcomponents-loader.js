/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

(function() {
  // Feature detect which polyfill needs to be imported.
  let polyfills = [];
  if (!('import' in document.createElement('link'))) {
    polyfills.push('hi');
  }
  if (!('attachShadow' in Element.prototype) || (window.ShadyDOM && window.ShadyDOM.force)) {
    polyfills.push('sd');
  }
  if (!window.customElements || window.customElements.forcePolyfill) {
    polyfills.push('ce');
  }
  if (!('content' in document.createElement('template')) || !window.Promise) {
    polyfills.push('pf');
  }

  if (polyfills.length === 4) { // hi-ce-sd-pf is actually called lite.
    polyfills = ['lite'];
  }

  if (polyfills.length) {
    var script = document.querySelector('script[src*="webcomponents-loader.js"]');
    let newScript = document.createElement('script');
    // Load it from the right place.
    var url = script.src.replace(
      'webcomponents-loader.js', `webcomponents-${polyfills.join('-')}.js`);
    newScript.src = url;
    document.head.appendChild(newScript);
  } else {
    // Ensure `WebComponentsReady` is fired also when there are no polyfills loaded.
    requestAnimationFrame(function() {
      window.dispatchEvent(new CustomEvent('WebComponentsReady'));
    });
  }
})();

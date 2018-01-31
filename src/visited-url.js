import {Element as PolymerElement}
  from "../node_modules/@polymer/polymer/polymer-element.js"

// Extend Polymer.Element base class
export class VisitedUrl extends PolymerElement {

  static get is() { return 'visited-url' }

  static get template() {
      return `
        <style>

        #url {
          user-select: all;
        }

        #visited-url {
          width: 100px;
          height: 100%;
          text-align: center;
          margin: 0;
          display: inline;
          margin-right: 0.5em;
          overflow-x: scroll;
        }

        #refresh-button {
            display: none;
            font-size: 18px;
            background-color: rgba(0,0,0,0);
            border: 1px solid #1a1a1a;
            vertical-align: middle;
            padding: 8px;
            margin-right: 20px;
            cursor: pointer;
            margin-bottom: 3px;
            background-color: rgba(255,255,255, 0.5);
        }

        .show {
          display: initial !important;
        }

        .hide {
          display: none !important;
        }

        strong {
          vertical-align: middle;
          font-size: 18px;
        }

        #url {
          font-size: 18px;
          margin-bottom: 0.5em;
          display: inline;
        }
    
      </style>

      <div id="visited-url">
        <strong>Share:</strong>
        <input id="url" readonly="readonly" onclick="this.select()" value="[[url]]">
      </div>
      <button id="refresh-button" on-click="refreshPage"> Create your own! </button>
    `
  }

  static get config() {
    // properties, observers meta data
    return {
        url : String,
        shared : Boolean
    };
  }

  connectedCallback() {
    super.connectedCallback();

    this.shared = window.location.search.indexOf('?countryCodes') > -1;
    const urlEl = this.querySelector("#visited-url");
    const buttonEl = this.querySelector("#refresh-button");
    if (this.shared) {
      urlEl.classList.add("hide");
      buttonEl.classList.add("show");
    }

    this.url = window.location.href;
    document.addEventListener('visitedUrl', this.setUrl.bind(this));
  } 

  refreshPage() {
    window.location = location.protocol + '//' + location.host + location.pathname;
  }

  setUrl(event, data) {
    this.url = event.detail.url;
  }

}

// Register custom element definition using standard platform API
customElements.define(VisitedUrl.is, VisitedUrl);


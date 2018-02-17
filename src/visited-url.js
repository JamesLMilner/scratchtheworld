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

        #webShare {
          display: none;
          width: 100%;
          font-size: 1em;
          height: 100%;
          background: #e0e0e0;
          border: none;
          font-weight: lighter;
          border-radius: 3px;
          vertical-align: middle;
          line-height: 1e;
          font-family: Lato, sans-serif;
        }
    
      </style>

      <button id="webShare"> Share </button>

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
    this.url = window.location.href;


    const urlEl = this.querySelector("#visited-url");
    const buttonEl = this.querySelector("#refresh-button");
    const webShare = this.querySelector("#webShare");

    if (navigator.share) {
      console.log("navigator share")
      webShare.addEventListener("click", () => {

        navigator.share({
          title: 'Scratch the World',
          text: "Check out countries I've visited!",
          url: this.url,
        })
          .then(() => console.log('Successful share'))
          .catch((error) => console.log('Error sharing', error))

      });

      urlEl.classList.add("hide");
      webShare.classList.add("show");

    }

    if (this.shared) {
      urlEl.classList.add("hide");
      webShare.classList.add("hide");
      buttonEl.classList.add("show");
    }

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


import {PolymerElement, html}
  from "../node_modules/@polymer/polymer/polymer-element.js"

// Extend Polymer.Element base class
export class CountryCounter extends PolymerElement {

  static get is() { return 'country-counter' }

  static get template() {
    return html`<style>
      #country-counter {
        width: 100%;
        height: 100%;
        text-align: center;
        margin: 0;
        font-size: 26px;
      }
      #percentage {
        padding-left: 1rem;
      }
    </style>
    <div id="country-counter">
      <strong>Visited:</strong>
      [[visited]] / [[total]] <span id="percentage">([[percentage]]%)</span>
    </div>`;
  }

  static get config() {
    // properties, observers meta data
    return {
        visited: 0,
        total : 0,
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.visited = 0;
    this.total = 0;
    document.addEventListener('totalCountries', this.setTotalCountries.bind(this));
    document.addEventListener('visitedCountries', this.setVisitedCountries.bind(this));
  }

  setTotalCountries(data) {
    this.total = data.detail.totalCountries;
    this.percentage = ((this.visited /  this.total) * 100).toFixed(2);
  }

  setVisitedCountries(data) {
    this.visited = data.detail.visitedCountries;
    this.percentage = ((this.visited /  this.total) * 100).toFixed(2);
  }

}

// Register custom element definition using standard platform API
customElements.define(CountryCounter.is, CountryCounter);


import {Element as PolymerElement} 
  from  "../node_modules/@polymer/polymer/polymer-element.js";

import { Map, control } 
  from "../node_modules/leaflet/dist/leaflet.js";

import * as labelgun 
  from "../node_modules/labelgun/lib/labelgun.js";

import * as polylabel
  from "../node_modules/polylabel/index.js";

import area from "../node_modules/@turf/area/index.js"

// Extend Polymer.Element base class
export class ScratchMap extends PolymerElement {

  static get is() { return 'scratch-map' }

  static get template() {
      return `
      <link href="./node_modules/leaflet/dist/leaflet.css" rel="stylesheet"> 
      <style>

      #map {
        width: 100%;
        height: 100%;
        background: white;
        padding: 0;
        margin: 0;
        z-index: 1;
        -webkit-tap-highlight-color: rgba(0,0,0,0);
        -webkit-tap-highlight-color: transparent;
        cursor: default;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }

      #map .label {
        opacity: 0;
        height: initial !important;
        display: inline-block;
        width: initial !important;
        padding: 3px !important;
        pointer-events: none;
        text-align: center;
      }

      svg {
        -webkit-tap-highlight-color: rgba(0,0,0,0);
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        cursor: default;
      }

      .animateFill {
        fill-opacity: 0;
        animation-timing-function: ease-in-out;
        animation-fill-mode: forwards;
        animation-iteration: 1;
        
        animation-name: fillIn;
        animation-duration: 3s;
        animation-delay: 0s;
      }

      @keyframes fillIn {
        from { fill-opacity: 0.35; }
        to { fill-opacity: 0.75; }
      }

    </style>

    <div id="map"></div>
  `
  }

  static get config() {
    // properties, observers meta data
    return {
      map : null,
      countriesStyle: null,
      scratchedCountriesStyle: null,
      totalVisited: 0,
      totalCountries: 0,
      visitedCountriesList: [],
      countryCodes: [],
      hideLabel: null,
      showLabel: null,
      labelEngine: null,
      markerLayer: [],
    };
  }

  connectedCallback() {
    super.connectedCallback();

  } 

  ready() {
    super.ready();

    this.hideLabel = function(label){ label.labelObject.style.opacity = 0; };
    this.showLabel = function(label){ label.labelObject.style.opacity = 0.8;};
    this.labelEngine = new labelgun.default(this.hideLabel, this.showLabel);
    this.markers = [];

    const mapEl = this.$.map;
    const mapOptions = {
      maxZoom: 8,
      minZoom: 2,
      attributionControl: false
    }
    this.map = new L.Map(mapEl, mapOptions).setView([0.0, 0.0], 3);
    L.control.attribution({position: "topright"} ).addTo(this.map)

    // Handle if the map is shared
    this.sharedCountryCodes = [];
    this.sharedLength = 0;

    if (window.location.search.indexOf('?countryCodes') > -1) {
      const codesUrl = window.location.href;
      const codesUrlObj = new URL(codesUrl);
      const codes = codesUrlObj.searchParams.get("countryCodes");
      this.sharedCountryCodes = JSON.parse(codes);
      this.sharedLength = this.sharedCountryCodes.length;
    };

    this.countryCodes = [];
    this.visitedCountriesList = [];

    // Styles for unscratched and scratched countries
    this.countriesStyle = { 
      stroke: true,
      color: "rgba(0,0,0,0.07)",
      weight: 2,
      fillOpacity: 0.45,
      fill: true,
      fillColor: "rgba(0,0,0,0.07)",
    }
    this.scratchedCountriesStyle = {
      fillColor: "#D4AF37",
      fillOpacity: 0.7,
      stroke: true,
      color: "rgba(0,0,0,0.07)",
    }
    
    //this.addOSMBasemapLayer();
    this.addCountriesLayer();

    // Remind me why this is in a timeout?
    setTimeout( () => {
      this.map.invalidateSize();
    }, 10);
    
  }

  addCountriesLayer() {

    window.addEventListener("load", () => {

      fetch("countries.geojson").then((geojson) => {
        this.markerLayer =  L.layerGroup();
        geojson.json().then((countries) => {
  
          const countryFeatures = L.geoJson(countries,    {
            style: this.styleFeature.bind(this),
            onEachFeature: this.onEachCountryFeature.bind(this)
          }).addTo(this.map);
        
          this.totalCountries = countries.features.length;
  
          countryFeatures.getLayers().forEach((layer) => {
            this.handleLabels(layer);
          });
          
          this.emitVisitedChange();
          this.emitTotalChange();
          this.emitUrlChange();

          setTimeout(() => {
            this.resetLabels(this.markerLayer);
            this.hideLoad();
          }, 0);
          
        });
      });
    })
    

    this.map.on("viewreset", () => {
      this.resetLabels(this.markerLayer);
    });

    this.map.on("zoomend", () => {
      this.resetLabels(this.markerLayer);
    });
  }

  hideLoad() {
    const containerId = "loadingCountriesContainer";
    document.getElementById(containerId).style.display = "none";
  }

  handleLabels(layer) {
    const countryName = layer.feature.properties.ADMIN
    this.countryCodes.push(countryName);

    const icon = L.divIcon({
      className: 'label',
      html : countryName,
      iconSize : [50, 12],
      iconAnchor : [25, 6]
    });
    const coords = layer.feature.geometry.coordinates;

    if (layer.feature.geometry.type === "Polygon") {
      this.createCenterMarker(coords, icon, countryName);
    } else if (layer.feature.geometry.type === "MultiPolygon") {
      
      let largest = { area: 0, polygon: null }

      coords.forEach((poly) => {
        const geojsonPoly = { type : "Polygon", coordinates : poly};
        const polyArea = area(geojsonPoly);

        if (polyArea > largest.area) {
          largest.area = polyArea;
          largest.polygon = poly;
        }
      })
      this.createCenterMarker(largest.polygon, icon, countryName);
    }
  }

  createCenterMarker(coordinates, icon, countryName) {
    const center = polylabel(coordinates, 1.0);
    const latLng = L.latLng([center[1], center[0]]);
    const point = this.map.latLngToContainerPoint(latLng);
    const newPoint = L.point([point.x, point.y-0]);
    const centeredLatLng = this.map.containerPointToLatLng(newPoint);
  
    const marker = L.marker(centeredLatLng, {icon: icon});  // Swap coordinates around
    this.markerLayer.addLayer(marker).addTo(this.map);

  }

  onEachCountryFeature(feature, layer) {
    const countryName = feature.properties.ADMIN

    if (this.sharedLength > 0) {
      
  
      const scratchedCountry = this.sharedCountryCodes.indexOf(countryName) > -1;

      if (scratchedCountry) {
          layer.setStyle(this.scratchedCountriesStyle);
      }

    } else {
        
      // If it is a shared link, it is an interactive map
      // We register both click and touch support
      const handle = function(event){ 

        const mapSvg = layer._path;

        // Toggle add
        if (mapSvg.classList.contains("animateFill")) {
          mapSvg.classList.remove("animateFill")
        } else {
          mapSvg.classList.add("animateFill")
        }
        
        this.handleClick(event, feature, layer) 
      }.bind(this);

      layer.on('click', handle);
      layer.on('tap', handle);

    }

  }

  handleClick(event, feature, layer) {
    const countryFeature = event.target;
    const countryCode = feature.properties.ADMIN; 
    const visited = this.getVisited(countryCode);
    
    if (visited === false || visited === null) {
      countryFeature.setStyle(this.scratchedCountriesStyle);
      this.setVisited(countryCode, "true");
      
    } else {
      countryFeature.setStyle(this.countriesStyle);
      this.setVisited(countryCode, "false");
    }

    this.emitVisitedChange();
    this.emitUrlChange();
  }

  styleFeature(feature, layer) {
    const visited = this.getVisited(feature.properties.ADMIN);
    if (visited === false || visited === null) {
        return this.countriesStyle; 
    } else {
      return this.scratchedCountriesStyle;
    }
  }

  getVisitedCount() {
    this.visitedCountries = 0;

    if (this.sharedLength) {
      this.visitedCountries = this.sharedLength;
    } else {
      this.countryCodes.forEach( (code) => {
        if (this.getVisited(code)) {
          this.visitedCountries += 1;
        } 
      });
    }

    return this.visitedCountries
  }

  emitTotalChange() {
    document.dispatchEvent(new CustomEvent('totalCountries', {
      detail : { totalCountries: this.totalCountries } 
    }));
  }

  emitVisitedChange() {
    document.dispatchEvent(new CustomEvent('visitedCountries', {
        detail : { visitedCountries: this.getVisitedCount() } 
    }));
  }

  emitUrlChange() {
    document.dispatchEvent(new CustomEvent('visitedUrl', {
        detail : { url: this.getUrl() } 
    }));
  }

  getVisited(countryCode) {
    const visited = localStorage.getItem(countryCode);
    if (visited === "true") {
      return true
    } else {
      return false
    }
  }
  
  setVisited(countryCode, hasVisited) {
    localStorage.setItem(countryCode, hasVisited);
  }

  getVisitedList() {
    this.visitedCountriesList = [];
    this.countryCodes.forEach( (code) => {
      if (this.getVisited(code)) {
        this.visitedCountriesList.push(code);
      } 
    });
    return JSON.stringify(this.visitedCountriesList);
  }

  getUrl() {
    let url = window.location.href.split('?')[0];
    url += '?countryCodes=' + this.getVisitedList();
    console.debug("Getting URL: ", url)
    return url;
  }

  resetLabels(markers) {

    var i = 0;
    markers.eachLayer((label) => {
      this.addLabel(label, ++i);
    });
    this.labelEngine.update();
  
  }
  
  addLabel(layer, id) {
  
    // This is ugly but there is no getContainer method on the tooltip :(
    var label = layer.getElement();
    //layer.style.marginLeft = -(layer.innerText.length * 10);
    if (label) {
  
      // We need the bounding rectangle of the label itself
      var rect = label.getBoundingClientRect();

      // We convert the container coordinates (screen space) to Lat/lng
      var bottomLeft = this.map.containerPointToLatLng([rect.left, rect.bottom]);
      var topRight = this.map.containerPointToLatLng([rect.right, rect.top]);
      var boundingBox = {
        bottomLeft : [bottomLeft.lng, bottomLeft.lat],
        topRight   : [topRight.lng, topRight.lat]
      };
 
      let weight = -parseInt(label.innerHTML.length);
      if (isNaN(weight)) weight = 1;

      // Ingest the label into labelgun itself
      this.labelEngine.ingestLabel(
        boundingBox,
        id,
        weight,
        label,
        "Test " + id,
        false
      );
  
      // If the label hasn't been added to the map already
      // add it and set the added flag to true
      if (!layer.added) {
        layer.addTo(this.map);
        layer.added = true;
      }
  
    }
  }

}

// Register custom element definition using standard platform API
customElements.define(ScratchMap.is, ScratchMap);

/*

INSTRUCTIONS
============

1.  Update the getPollingPlaces function to get the Philadelphia Polling Places
    GeoJSON data from OpenDataPhilly using the `fetch` function, AND COMBINE
    DUPLICATE POLLING PLACES. Keep a list of unique polling places and the
    precincts that correspond to each place. The data is available at
    https://opendataphilly.org/datasets/polling-places/.

2.  Update the initPollingPlaceLayer function to add a popup to each marker
    that shows the name (`placename`), address (`street_address`), and the list
    of precincts that vote at the polling place.

*/

import 'leaflet';

/* globals L */
const POLLING_PLACES_URL = 'https://phl.carto.com/api/v2/sql?q=SELECT+*+FROM+polling_places&filename=polling_places&format=geojson&skipfields=cartodb_id';

/**
 * Creates a polling places Leaflet map object.
 * @param {string|HTMLElement} elementOrId The DOM element where the map will live
 * @returns {L.Map} The constructed Leaflet Map
 */
function initPollingPlaceMap(elementOrId) {
  const map = L.map(elementOrId).setView([39.9526, -75.1652], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  return map;
}

/**
 * Fetches the polling place data from OpenDataPhilly AND
 * AGGREGATES IT BASED ON UNIQUE STREET ADDRESSES.
 * @returns {Promise<GeoJSON.FeatureCollection>} The deduplicated polling place data.
 */
async function getPollingPlaceData() {
  const response = await fetch('https://phl.carto.com/api/v2/sql?q=SELECT+*+FROM+polling_places&filename=polling_places&format=geojson&skipfields=cartodb_id');
  if (!response.ok) {
    throw new Error(`Failed to fetch polling places: ${response.status}`);
  }
  return await response.json();
}

/**
 * Creates a Leaflet GeoJSON layer for polling places and adds it to the map.
 * @param {L.Map} map The Leaflet map where the layer will be added.
 * @returns {Promise<L.GeoJSON>} The constructed Leaflet GeoJSON layer.
 */
async function initPollingPlaceLayer(map) {
  const pollingPlaceData = await getPollingPlaceData();
  window.getPollingPlaceData = pollingPlaceData;

const icon = L.icon({
  iconUrl: 'img/polling-place-marker.png',
  iconSize: [30, 36],
  iconAnchor: [15, 36],
  popupAnchor: [0, -36],
  shadowUrl: 'img/polling-place-marker-shadow.png',
  shadowSize: [40, 48],
  shadowAnchor: [20, 48],
});



  const layer = L.geoJSON(pollingPlaceData, {
    pointToLayer: (feature, latlng) => {
      return L.marker(latlng, { icon: icon });
    },
    onEachFeature: function (feature, layer) {
      layer.bindPopup(`
        <div>
        <p>${feature.properties.placename}</p>
        <p>${feature.properties.street_address}</p>
        <p>Precincts: ${feature.properties.precincts ? feature.properties.precincts.join(', ') : 'None'}</p>
        </div>
      `);
    },
  }).addTo(map);

  return layer;
}

window.pollingPlaceMap = initPollingPlaceMap('map');
window.pollingPlaceLayer = await initPollingPlaceLayer(window.pollingPlaceMap);

function handleGeolocationSuccess(pos) {
  console.log(pos);
  window.pollingPlaceMap.flyTo([pos.coords.latitude, pos.coords.longitude], 18);

}

function handleGeolocationError(err) {
  console.error(err);
}

const locateBtn = document.querySelector('#findNearestPollingPlaceBtn');
locateBtn.addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition((pos) => {
    console.log(pos);
    pollingPlaceMap.flyTo([pos.coords.latitude, pos.coords.longitude], 18);
  }, (err) => {
    console.error(err);
  });
});



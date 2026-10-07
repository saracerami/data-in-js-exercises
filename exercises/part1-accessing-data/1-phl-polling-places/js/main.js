/*

INSTRUCTIONS
============

1.  Update the getPollingPlaces function to get the Philadelphia Polling Places
    GeoJSON data from OpenDataPhilly using the `fetch` function, and display
    each location as a marker on a Leaflet map. The data is available at
    https://opendataphilly.org/datasets/polling-places/.

2.  Update the initPollingPlaceLayer function to add a popup to each marker
    that shows the name (`placename`) and address (`street_address`) of the
    polling place.

*/

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
 * Fetches the polling place data from OpenDataPhilly.
 * @returns {Promise<GeoJSON.FeatureCollection>} The polling place data.
 */
async function getPollingPlaceData() {  
const pollingPlaces = await fetch(POLLING_PLACES_URL);
return pollingPlaces;
}

async function showPollingPlaces() {
  const pollingPlaces = await getPollingPlaceData();

console.log(pollingPlaces);

L.geoJSON(pollingPlaces, {
  pointToLayer: (feature, latLng) => {
  return L.marker(latlng);
  },
onEachFeature: (feature, layer) => {
  layer.bindPopup(feature.properties.placename);
    },
  }).addTo(map);
}

showPollingPlaces();


/**
 * Creates a Leaflet GeoJSON layer for polling places and adds it to the map.
 * @param {L.Map} map The Leaflet map where the layer will be added.
 * @returns {Promise<L.GeoJSON>} The constructed Leaflet GeoJSON layer.
 */
async function initPollingPlaceLayer(map) {
  const pollingPlaces = await getPollingPlaceData();

  // Create a custom icon for polling places.
  const icon = L.icon({
    iconUrl: 'map-marker.png',
    iconSize: [30, 36],
    iconAnchor: [15, 36],
    popupAnchor: [0, -36],
    shadowUrl: 'img/polling-place-marker-shadow.png',
    shadowSize: [40, 48],
    shadowAnchor: [20, 48],
  });

  // Create a GeoJSON layer with the polling place data. Override the default
  // pointToLayer function to construct markers with the custom icon.
  const layer = L.geoJSON(pollingPlaceData, {
    pointToLayer: (feature, latlng) => {
      return L.marker(latlng, { icon: icon });
    },
    onEachFeature: (feature, layer) => {
      const placeName = feature.properties.placename; 
      const address = feature.properties.street_address; 
      
      layer.bindPopup(`
        <strong>${placeName}</strong><br>${address}
        `);
    }
  }).addTo(map);

  return layer;
}

window.pollingPlaceMap = initPollingPlaceMap('map');
window.pollingPlaceLayer = await initPollingPlaceLayer(window.pollingPlaceMap);

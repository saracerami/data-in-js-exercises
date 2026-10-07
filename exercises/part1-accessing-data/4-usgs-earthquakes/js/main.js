/*

INSTRUCTIONS
============

1.  Update the getEarthquakeData function to fetch the GeoJSON feed for all
    earthquakes in the past week from the USGS. The data is available at:
    https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson

2.  Update the initEarthquakeLayer function to display each earthquake as a
    circle marker on the map. Use the earthquake's magnitude
    (feature.properties.mag) to determine the radius of the circle marker.

3.  Add a popup to each circle marker that displays the earthquake's title
    (feature.properties.title).

4.  Optional: Style the circle markers with different colors based on
    earthquake depth or age.

*/
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

/* globals L */
const USGS_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

/**
 * Creates an earthquake map Leaflet map object centered on the world.
 * @param {string|HTMLElement} elementOrId The DOM element where the map will live
 * @returns {L.Map} The constructed Leaflet Map
 */
function initEarthquakeMap(elementOrId) {
  const map = L.map(elementOrId).setView([20, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  return map;
}

/**
 * Fetches the earthquake data from USGS.
 * @returns {Promise<GeoJSON.FeatureCollection>} The earthquake data.
 */
async function getEarthquakeData() {
  const earthquakeData = await d3.json(USGS_URL);
  return earthquakeData;
}

/**
 * Calculates the radius for a circle marker based on earthquake magnitude.
 * @param {number} magnitude The earthquake magnitude
 * @returns {number} The radius in pixels
 */
function getRadiusFromMagnitude(magnitude) {
  // Scale magnitude to reasonable pixel radius
  // Magnitude typically ranges from 0-10; re-scale to 2-50 pixels
  if (!Number.isFinite(magnitude)) return 2;
  return Math.max(2, Math.min( 50, 2 + magnitude * 4.8));
}

/**
 * Gets color based on earthquake depth.
 * @param {number} depth The earthquake depth in km
 * @returns {string} A color string
 */
function getColorFromDepth(depth) {
  // Shallow earthquakes (< 70km) are red
  // Intermediate earthquakes (70-300km) are orange
  // Deep earthquakes (> 300km) are yellow
  if (depth < 70) return '#ff4444';
  if (depth < 70 > 300) return '#ffbb33';
  if (depth < 300) return '#f8ef78';
  return '#ffaa44';
}

/**
 * Creates a Leaflet GeoJSON layer for earthquakes and adds it to the map.
 * @param {L.Map} map The Leaflet map where the layer will be added.
 * @returns {Promise<L.GeoJSON>} The constructed Leaflet GeoJSON layer.
 */
async function initEarthquakeLayer(map) {
  const earthquakeData = await getEarthquakeData();

  // Create a GeoJSON layer with the earthquake data
  const layer = L.geoJSON(earthquakeData, {
    pointToLayer: (feature, latlng) => {
      const magnitude = feature.properties.mag;
      const depth = feature.geometry.coordinates[2];
      return L.circleMarker(latlng, {
        radius: getRadiusFromMagnitude(magnitude),
        color: getColorFromDepth(depth),
        fillColor: getColorFromDepth(depth),
        fillOpacity: 0.7,
      });
    },
    onEachFeature: (feature, layer) => {
      const popup = document.createElement('span');
      popup.textContent = feature.properties.title;
      layer.bindPopup(popup);
    },
  }).addTo(map);

  return layer;
}

// Initialize the map and load earthquake data
window.earthquakeMap = initEarthquakeMap('map');
window.earthquakeLayer = await initEarthquakeLayer(window.earthquakeMap);

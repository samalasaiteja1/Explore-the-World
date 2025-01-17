// Setting your Mapbox access token
mapboxgl.accessToken = mapToken; 

// Creating a new map
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // specify a Mapbox style
    center: listing.geometry.coordinates, // centering the map at the coordinates of the listing
    zoom: 8 // zoom level
});

// Adding a marker to the map at the listing's coordinates
const marker = new mapboxgl.Marker({ color: 'red' })
    .setLngLat(listing.geometry.coordinates) // setting marker position
    .setPopup(new mapboxgl.Popup({ offset: 25 }) // adding popup to marker
        .setHTML(`
            <h4>${listing.title}</h4>
            <p>Exact Location will be provided after booking</p>
            <a href="https://www.google.com/maps/search/?api=1&query=${listing.geometry.coordinates[1]},${listing.geometry.coordinates[0]}" target="_blank">View on Google Maps</a>
        `)) // setting popup content with the link to Google Maps only
    .addTo(map); // adding marker to map

// Function to fetch directions from Mapbox Directions API
async function getDirections(start, destination) {
    const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${destination.lng},${destination.lat}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
    
    const response = await fetch(directionsUrl);
    const data = await response.json();

    if (data.routes.length > 0) {
        const route = data.routes[0].geometry.coordinates;

        // Adding the route to the map
        map.addSource('route', {
            type: 'geojson',
            data: {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: route
                }
            }
        });

        map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#888',
                'line-width': 6
            }
        });
    }
}

// Example starting and destination locations
const startLocation = { lng: listing.geometry.coordinates[0], lat: listing.geometry.coordinates[1] }; // Use listing coordinates as the start point
const destinationLocation = { lng: YOUR_DESTINATION_LNG, lat: YOUR_DESTINATION_LAT }; // Replace with your actual destination coordinates

// Call the function to get directions
getDirections(startLocation, destinationLocation);

// Function to resize the map
function resizeMap() {
    const mapContainer = document.getElementById('map');
    const mapWidth = mapContainer.offsetHeight * 0.8; // 80% of the viewport height
    const mapHeight = mapContainer.offsetHeight;

    map.resize();
    mapContainer.style.width = mapWidth + 'px'; // Set map container width
    mapContainer.style.height = mapHeight + 'px'; // Set map container height
}

// Call resizeMap on window resize
window.addEventListener('resize', resizeMap);

// Initial resize to set the correct size
resizeMap();

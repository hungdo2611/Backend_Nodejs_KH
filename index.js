const express = require('express')


var admin = require("firebase-admin");

var serviceAccount = require("./be-booking-6dd8b-firebase-adminsdk-mhr7h-2e93874e1a.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const customer_router = require('./customer/routers/user')
const { driver_router } = require('./driver/routers/driver')
const Journey_router = require('./driver/routers/journeys')
const routerBooking = require("./customer/routers/booking")
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require("swagger-jsdoc")
const port = process.env.PORT
const geolib = require('geolib');
require('./db/db')
const H = require('@here/maps-api-for-javascript');





const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'BackEnd NodeJs',
            version: '1.0.0',
        },
        servers: [
            {
                url: "http://localhost:3000"
            }
        ]
    },
    apis: ['./routers/*.js'], // files containing annotations as above
};
const specs = swaggerJsDoc(options)

const app = express()
app.use(express.json())
app.use(customer_router)
app.use(driver_router)
app.use(Journey_router)
app.use(routerBooking)


app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs))

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})


//

var platform = new H.service.Platform({
    'apikey': 'NhNOeG_8-1IEym3KD92F8YWohmMCbQ99NvEjgmeZzuc'
});
// Retrieve the target element for the map:
var targetElement = document.getElementById('mapContainer');

// Get the default map types from the platform object:
var defaultLayers = platform.createDefaultLayers();

// Instantiate the map:
var map = new H.Map(
    document.getElementById('mapContainer'),
    defaultLayers.vector.normal.map,
    {
        zoom: 10,
        center: { lat: 52.51, lng: 13.4 }
    });

// Create the parameters for the routing request:
var routingParameters = {
    'routingMode': 'fast',
    'transportMode': 'car',
    // The start point of the route:
    'origin': '50.1120423728813,8.68340740740811',
    // The end point of the route:
    'destination': '52.5309916298853,13.3846220493377',
    // Include the route shape in the response
    'return': 'polyline'
};

// Define a callback function to process the routing response:
var onResult = function (result) {
    // ensure that at least one route was found
    if (result.routes.length) {
        result.routes[0].sections.forEach((section) => {
            // Create a linestring to use as a point source for the route line
            let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);
            console.log("linestring", linestring)
            // Create a polyline to display the route:
            let routeLine = new H.map.Polyline(linestring, {
                style: { strokeColor: 'blue', lineWidth: 3 }
            });

            // Create a marker for the start point:
            let startMarker = new H.map.Marker(section.departure.place.location);

            // Create a marker for the end point:
            let endMarker = new H.map.Marker(section.arrival.place.location);

            // Add the route polyline and the two markers to the map:
            map.addObjects([routeLine, startMarker, endMarker]);

            // Set the map's viewport to make the whole route visible:
            map.getViewModel().setLookAtData({ bounds: routeLine.getBoundingBox() });
        });
    }
};

// Get an instance of the routing service version 8:
var router = platform.getRoutingService(null, 8);

// Call calculateRoute() with the routing parameters,
// the callback and an error callback function (called if a
// communication error occurs):
router.calculateRoute(routingParameters, onResult,
    function (error) {
        alert(error.message);
    });
const express = require('express')
const customer_router = require('./customer/routers/user')
const driver_router = require('./driver/routers/driver')
const Journey_router = require('./driver/routers/journeys')
const routerBooking = require("./customer/routers/booking")
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require("swagger-jsdoc")
const port = process.env.PORT
const geolib = require('geolib');

require('./db/db')
const distance = geolib.getDistanceFromLine(
    { latitude: 21.11349055530133, longitude: 105.80195387261992 },
    { latitude: 21.028902, longitude: 105.778228 },
    { latitude: 21.119236640130893, longitude: 105.80585501904564, },
);
const rhumbline = geolib.findNearest({ latitude: 52.456221, longitude: 12.63128 }, [
    { latitude: 52.516272, longitude: 13.377722 },
    { latitude: 51.515, longitude: 7.453619 },
    { latitude: 51.503333, longitude: -0.119722 },
    { latitude: 55.751667, longitude: 37.617778 },
    { latitude: 48.8583, longitude: 2.2945 },
    { latitude: 59.3275, longitude: 18.0675 },
    { latitude: 59.916911, longitude: 10.727567 },
]);

console.log("rhumbline", rhumbline)
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
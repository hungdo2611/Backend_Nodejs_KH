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
console.log("distance", distance)
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
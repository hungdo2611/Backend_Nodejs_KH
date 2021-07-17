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


var admin = require("firebase-admin");

var serviceAccount = require("./be-booking-6dd8b-firebase-adminsdk-mhr7h-2e93874e1a.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});



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
const express = require('express')


var admin = require("firebase-admin");

var serviceAccount = require("./be-booking-6dd8b-firebase-adminsdk-mhr7h-2e93874e1a.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const cors = require('cors');

const customer_router = require('./customer/routers/user')
const routerBooking = require("./customer/routers/booking")
const coupon_code_router = require('./customer/routers/coupon_router')

const { driver_router } = require('./driver/routers/driver')
const Journey_router = require('./driver/routers/journeys')
const notification_router = require("./driver/routers/notification_router")
const license_router = require('./driver/routers/licenseRouter')
const transaction_router = require('./driver/routers/transactionRouter')

//admin
const adminRouter = require('./admin/routers/adminRouter')
const adminDriver = require('./admin/routers/adminDriver')
const adminCustomer_router = require('./admin/routers/adminCustomer')
const adminLicense = require('./admin/routers/adminLicense')
const adminCoupon = require('./admin/routers/adminCoupon')
const adminNotification = require('./admin/routers/adminNotification')

const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require("swagger-jsdoc")
const port = process.env.PORT
const geolib = require('geolib');
require('./db/db')




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
app.use(cors({
    origin: ['http://localhost:3006'],
    credentials: true,

}));
app.use(express.json())
//admin
app.use(adminRouter)
app.use(adminDriver)
app.use(adminCustomer_router)
app.use(adminLicense)
app.use(adminCoupon)
app.use(adminNotification)


//customer
app.use(customer_router)
app.use(routerBooking)
app.use(coupon_code_router)

//driver
app.use(Journey_router)
app.use(driver_router)
app.use(notification_router)
app.use(license_router)
app.use(transaction_router)






app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs))

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
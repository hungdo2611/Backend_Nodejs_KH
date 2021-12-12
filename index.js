const express = require('express')


var admin = require("firebase-admin");

var serviceAccount = require("./be-booking-6dd8b-firebase-adminsdk-mhr7h-2e93874e1a.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const cors = require('cors');
// customer
const customer_router = require('./customer/routers/user')
const routerBooking = require("./customer/routers/booking")
const coupon_code_router = require('./customer/routers/coupon_router')
const notification_router_customer = require('./customer/routers/notification_router')
//driver
const { driver_router } = require('./driver/routers/driver')
const Journey_router = require('./driver/routers/journeys')
const notification_router = require("./driver/routers/notification_router")
const license_router = require('./driver/routers/licenseRouter')
const transaction_router = require('./driver/routers/transactionRouter')
const charge_router = require('./driver/routers/charge_router')
//admin
const adminRouter = require('./admin/routers/adminRouter')
const adminDriver = require('./admin/routers/adminDriver')
const adminCustomer_router = require('./admin/routers/adminCustomer')
const adminLicense = require('./admin/routers/adminLicense')
const adminCoupon = require('./admin/routers/adminCoupon')
const adminNotification = require('./admin/routers/adminNotification')
const adminCharge = require('./admin/routers/adminCharge')


//
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require("swagger-jsdoc")
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
app.use('/api', adminRouter)
app.use('/api', adminDriver)
app.use('/api', adminCustomer_router)
app.use('/api', adminLicense)
app.use('/api', adminCoupon)
app.use('/api', adminNotification)


//customer
app.use('/api', customer_router)
app.use('/api', routerBooking)
app.use('/api', coupon_code_router)
app.use('/api', notification_router_customer)


//driver
app.use('/api', Journey_router)
app.use('/api', driver_router)
app.use('/api', notification_router)
app.use('/api', license_router)
app.use('/api', transaction_router)
app.use('/api', charge_router)
app.use('/api', adminCharge)







app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs))

app.listen(3000, () => {
    console.log(`Server running on port 3000`)
})
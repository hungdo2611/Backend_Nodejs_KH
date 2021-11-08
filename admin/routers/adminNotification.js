const express = require('express')
const auth = require('../middleware/auth')

const adminNotification = express.Router()
const { pushNotificationToTopic } = require('../../utils/index')
const { CONSTANT_NOTIFICATION } = require('../../constant')
const APP_NAME = {
    Driver: 'Driver',
    Customer: 'Customer'
}
adminNotification.post('/admin/notification', auth, async (req, res) => {
    try {
        const { app_name, title, body, data } = req.body;
        pushNotificationToTopic(app_name, title, body, data)
        res.status(200).send({ err: false, data: "success" })
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})
module.exports = adminNotification;
const express = require('express')
const { auth, authWithoutData } = require('../middleware/auth')

const adminNotification = express.Router()
const { pushNotificationToTopic, deleteRedisData } = require('../../utils/index')
const { REDIS_KEY } = require('../../constant')

const NotificationDriver = require('../../driver/models/notification')
const NotificationCustomer = require('../../customer/models/notification')
const Notification_Customer = require('../../customer/models/notification')

const APP_NAME = {
    Driver: 'Driver',
    Customer: 'Customer'
}
adminNotification.post('/admin/notification', authWithoutData, async (req, res) => {
    try {
        const { app_name, title, body, data } = req.body;
        if (!app_name || !title || !body) {
            res.status(400).send({ err: true, data: 'missing param' })
            return
        }
        if (app_name == APP_NAME.Driver) {
            const notification = new NotificationDriver({ time: Date.now(), title: title, content: body, data: data })
            await notification.save();
            deleteRedisData(REDIS_KEY.NOTIFICATION_DRIVER);
        } else {
            const notification = new Notification_Customer({ time: Date.now(), title: title, content: body, data: data })
            await notification.save();
            deleteRedisData(REDIS_KEY.NOTIFICATION_CUSTOMER);
        }
        pushNotificationToTopic(app_name, title, body, data)
        res.status(200).send({ err: false, data: "success" })
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})
module.exports = adminNotification;
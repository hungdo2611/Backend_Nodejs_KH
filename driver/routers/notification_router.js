const express = require('express')
const Notification = require('../models/notification')
const { auth, authWithoutData } = require('../middleware/auth')
const { getRedisData, setRedisData } = require('../../utils')
const { REDIS_KEY } = require('../../constant')
const notification_router = express.Router()

notification_router.get('/notification', authWithoutData, async (req, res) => {
    try {
        let dataRedis = await getRedisData(REDIS_KEY.NOTIFICATION_DRIVER);
        if (dataRedis) {
            console.log("dataRedis", dataRedis)
            res.status(200).send({ err: false, data: dataRedis })
            return
        } else {
            const notifications = await Notification.paginate({}, { page: 1, limit: 20, sort: { $natural: -1 } });
            await setRedisData(REDIS_KEY.NOTIFICATION_DRIVER, notifications.docs);
            res.status(200).send({ err: false, data: notifications.docs })
        }

    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})

module.exports = notification_router;
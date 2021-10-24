const express = require('express')
const Notification = require('../models/notification')
const { auth } = require('../middleware/auth')

const notification_router = express.Router()

notification_router.get('/notification', auth, async (req, res) => {
    try {
        const { page_nunmber, page_size } = req.query;
        const notifications = await Notification.paginate({ driver_id: req.user._id }, { page: page_nunmber, limit: page_size, sort: { $natural: -1 } });
        res.status(200).send({ err: false, data: notifications.docs, total: notifications.totalDocs })
    } catch (error) {
        console.log("error", error)
                res.status(400).send({ err: true, error })

    }
})

module.exports = notification_router;
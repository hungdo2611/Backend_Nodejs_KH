const express = require('express')
const { auth, authWithoutData } = require('../middleware/auth')
const userAuth = require('../../customer/middleware/auth')
const adminBanner = express.Router()
const { pushNotificationToTopic, deleteRedisData } = require('../../utils/index')
const { REDIS_KEY } = require('../../constant')
const Banner = require('../models/banner')
const { getRedisData, setRedisData } = require('../../utils')
const { ReturnDocument } = require('mongodb')

// add new banner
adminBanner.post('/admin/banner', authWithoutData, async (req, res) => {
    try {
        const { link_image, type } = req.body;
        if (!link_image || !type) {
            res.status(400).send({ err: true, data: 'missing param' })
            return
        }
        const banner = new Banner({
            time: Date.now(),
            linkImage: link_image,
            type: type
        })
        await banner.save();
        deleteRedisData(REDIS_KEY.BANNER_APP);
        res.status(200).send({ err: false, data: "success" })
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})

// update banner 
adminBanner.post('/admin/update/banner', authWithoutData, async (req, res) => {
    try {
        const { link_image, type, _id } = req.body;
        if (!link_image || !type) {
            res.status(400).send({ err: true, data: 'missing param' })
            return
        }
        const newdata = await Banner.findOneAndUpdate({ _id: _id }, { linkImage: link_image, type: type, time: Date.now() })
        deleteRedisData(REDIS_KEY.BANNER_APP);
        res.status(200).send({ err: false, data: "success" })
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})
// update banner 
adminBanner.post('/admin/delete/banner', authWithoutData, async (req, res) => {
    try {
        const { _id } = req.body;
        const newdata = await Banner.deleteOne({ _id: _id })
        deleteRedisData(REDIS_KEY.BANNER_APP);
        res.status(200).send({ err: false, data: "success" })
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})

// get List Banner
adminBanner.get('/admin/banner', authWithoutData, async (req, res) => {
    try {
        let dataRedis = await getRedisData(REDIS_KEY.BANNER_APP);
        if (dataRedis) {
            res.status(200).send({ err: false, data: dataRedis })
            return
        } else {
            const notifications = await Banner.find();
            await setRedisData(REDIS_KEY.BANNER_APP, notifications);
            res.status(200).send({ err: false, data: notifications })
            return
        }
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})
//user get List Banner
adminBanner.get('/user/banner', userAuth.authWithoutData, async (req, res) => {
    try {
        let dataRedis = await getRedisData(REDIS_KEY.BANNER_APP);
        if (dataRedis) {
            res.status(200).send({ err: false, data: dataRedis })
            return
        } else {
            const notifications = await Banner.find();
            await setRedisData(REDIS_KEY.BANNER_APP, notifications);
            res.status(200).send({ err: false, data: notifications })
            return
        }
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})
module.exports = adminBanner;
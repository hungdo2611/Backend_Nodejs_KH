const express = require('express')
const Admin = require('../models/user')
const auth = require('../middleware/auth')
const parsePhoneNumber = require('libphonenumber-js')

const Driver = require('../../driver/models/driver')
const Journey = require('../../driver/models/journeys')
const { CONSTANT_NOTIFICATION } = require('../../constant')
const { pushNotificationTo_User, pushNotificationToTopic } = require('../../utils/index')

const adminDriver = express.Router()
adminDriver.get('/admin/driver', auth, async (req, res) => {
    try {
        const { page_number, page_size } = req.query;
        if (!page_number || !page_size) {
            res.status(400).send({ err: true, data: 'missing param' })
        }
        const lst_driver = await Driver.paginate(
            {},
            {
                populate: { path: 'verified_status', select: "status" },
                page: page_number,
                limit: page_size,
                forceCountFn: true,
                sort: { $natural: -1 },
                projection: { tokens: 0, password: 0, }
            });
        res.status(200).send({ data: lst_driver.docs, err: false, total: lst_driver.totalDocs })


    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }

})

adminDriver.post('/admin/lock/driver', auth, async (req, res) => {
    try {
        const { _id } = req.body;
        if (!_id) {
            res.status(400).send({ err: true, data: 'missing param' })
        }
        const driver = await Driver.findOneAndUpdate({ _id: _id }, { is_active: false });
        pushNotificationTo_User(
            [driver.device_token],
            'Tài khoản đã bị khoá',
            'Vui lòng liên hệ mới ADMIN để được hỗ trợ',
            {
                type: CONSTANT_NOTIFICATION.DRIVER_LOCKED_ACCOUNT
            })
        res.status(200).send({ data: "success", err: false })
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})
adminDriver.post('/admin/unlock/driver', auth, async (req, res) => {
    try {
        const { _id } = req.body;
        if (!_id) {
            res.status(400).send({ err: true, data: 'missing param' })
        }
        const driver = await Driver.findOneAndUpdate({ _id: _id }, { is_active: true });
        pushNotificationTo_User(
            [driver.device_token],
            'Tài khoản được mở khoá',
            'Bạn có thể tiếp tục sử dụng dịch vụ của 9Trip',
            {
                type: CONSTANT_NOTIFICATION.DRIVER_UNLOCKED_ACCOUNT
            })
        res.status(200).send({ data: "success", err: false })
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})

adminDriver.get('/admin/driver/info', auth, async (req, res) => {
    try {
        const { phone } = req.query;
        if (!phone) {
            res.status(400).send({ err: true, data: 'missing param' })
        }
        const phoneNumber = parsePhoneNumber(phone, 'VN')

        const driver = await Driver.findOne({ phone: phoneNumber.number }, { tokens: 0, password: 0, });

        res.status(200).send({ data: driver, err: false })


    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }

})
adminDriver.get('/admin/driver/recentJourney', auth, async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            res.status(400).send({ err: true, data: 'missing param' })
        }

        const lst_journey = await Journey.paginate(
            { driver_id: id },
            {
                page: 1,
                limit: 10,
                forceCountFn: true,
                sort: { $natural: -1 },
            });


        res.status(200).send({ data: lst_journey.docs, err: false, total: lst_journey.totalDocs })


    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }

})

module.exports = adminDriver;
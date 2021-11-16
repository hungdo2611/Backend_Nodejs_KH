const express = require('express')
const Admin = require('../models/user')
const { auth, authWithoutData } = require('../middleware/auth')
const parsePhoneNumber = require('libphonenumber-js')

const Driver = require('../../driver/models/driver')
const Journey = require('../../driver/models/journeys')
const { CONSTANT_NOTIFICATION, TYPE_TRANSACTION } = require('../../constant')
const { pushNotificationTo_User, pushNotificationToTopic } = require('../../utils/index')
const mongoose = require('mongoose')
const Charge = require('../../driver/models/charge')
const Transaction = require('../../driver/models/transaction')
const adminDriver = express.Router()
adminDriver.get('/admin/driver', authWithoutData, async (req, res) => {
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
                projection: { password: 0, }
            });
        res.status(200).send({ data: lst_driver.docs, err: false, total: lst_driver.totalDocs })


    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }

})

adminDriver.post('/admin/lock/driver', authWithoutData, async (req, res) => {
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
adminDriver.post('/admin/unlock/driver', authWithoutData, async (req, res) => {
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

adminDriver.get('/admin/driver/info', authWithoutData, async (req, res) => {
    try {
        const { phone } = req.query;
        if (!phone) {
            res.status(400).send({ err: true, data: 'missing param' })
        }
        const phoneNumber = parsePhoneNumber(phone, 'VN')

        const driver = await Driver.findOne({ phone: phoneNumber.number }, { password: 0, });

        res.status(200).send({ data: driver, err: false })


    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }

})
adminDriver.get('/admin/driver/recentJourney', authWithoutData, async (req, res) => {
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

adminDriver.post('/admin/driver/addpoint', authWithoutData, async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { id, point, title, body } = req.body;
        if (!id || !point || !title || !body) {
            res.status(400).send({ err: true, data: 'missing param' })
        }
        await session.withTransaction(async () => {
            const opts = { session, returnOriginal: false };
            let driver = await Driver.findOne({ _id: id });
            driver.point = driver.point + point;
            const transaction_charge = new Transaction({
                driver_id: driver._id,
                time: (Date.now() / 1000) >> 0,
                type: TYPE_TRANSACTION.ADD_CHARGE_MONEY,
                content: title,
                amount: point
            })
            const promise_save_driver = driver.save(opts);
            const promise_save_transaction = transaction_charge.save(opts)
            const save_action = await Promise.all([promise_save_driver, promise_save_transaction])
            pushNotificationTo_User(
                [driver.device_token],
                title, body,
                {
                    type: CONSTANT_NOTIFICATION.CHARGE_MONEY_SUCCESS,
                })
            res.status(200).send({ err: false, data: "success" })
        })
        session.endSession();
    } catch (error) {
        console.log("error", error)
        session.endSession();
        res.status(400).send({ err: true, error })

    }
})

module.exports = adminDriver;
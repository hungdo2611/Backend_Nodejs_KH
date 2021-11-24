const express = require('express')
const Charge = require('../models/charge')
const { auth, authWithoutData } = require('../middleware/auth')
const Driver = require('../models/driver')
const mongoose = require('mongoose')
const Transaction = require('../../driver/models/transaction')
const { TYPE_TRANSACTION, CONSTANT_NOTIFICATION } = require('../../constant')
const { pushNotificationTo_User } = require('../../utils/index')

const charge_router = express.Router()
const status_charge = {
    REQUESTING: 'REQUESTING',
    ACCEPT: 'ACCEPT',
    DECLINE: 'DECLINE',
    CANCEL: 'CANCEL'
}
const parsePhoneNumber = require('libphonenumber-js')


const CONSTANT_PAYMENT = {
    BANK: 'BANK',
    VIETTEL_PAY: 'VIETTEL_PAY'
}
// request charge
charge_router.get('/transfer/info', authWithoutData, async (req, res) => {
    try {
        const { phone } = req.query;
        if (!phone) {
            res.status(400).send({ err: true, data: 'missing param' })
            return
        }
        const phoneNumber = parsePhoneNumber(phone, 'VN')

        const driver = await Driver.findOne({ phone: phoneNumber.number })
        if (driver) {
            res.status(200).send({ err: false, data: { name: driver.name, _id: driver._id } })
        } else {
            res.status(200).send({ err: true, data: null })

        }
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})
charge_router.post('/transfer/driver', auth, async (req, res) => {
    const session = await mongoose.startSession();
    try {
        let { id, amount } = req.body;
        amount = Math.abs(amount);
        await session.withTransaction(async () => {
            const opts = { session, returnOriginal: false };
            if (id == req.user._id) {
                session.endSession();
                res.status(200).send({ err: true, data: 'SAME_ID' })
                return
            }
            if (req.user.point < amount) {
                session.endSession();
                res.status(200).send({ err: true, data: 'NOT_ENOUGH_MONEY' })
            }

            let driverReceived = await Driver.findOne({ _id: id });
            driverReceived.point = driverReceived.point + amount;
            const transaction_charge = new Transaction({
                driver_id: driverReceived._id,
                time: (Date.now() / 1000) >> 0,
                type: TYPE_TRANSACTION.ADD_CHARGE_MONEY,
                content: `Bạn đã được nhận ${amount}đ từ tài khoản ${req.user.name}`,
                amount: amount
            })
            const promise_save_driver = driverReceived.save(opts);
            const promise_save_transaction = transaction_charge.save(opts)

            req.user.point = req.user.point - amount;
            const save_sending = req.user.save(opts);
            const transaction_charge_sending = new Transaction({
                driver_id: req.user._id,
                time: (Date.now() / 1000) >> 0,
                type: TYPE_TRANSACTION.SEND_MONEY_TO_OTHER,
                content: `Bạn đã chuyển ${amount}đ đến tài khoản ${driverReceived.name}`,
                amount: amount
            })
            const save_trans_sending = transaction_charge_sending.save(opts)
            if (driverReceived.device_token) {
                pushNotificationTo_User(
                    [driverReceived.device_token],
                    `Bạn đã được nhận ${amount}đ`, `Bạn đã được nhận ${amount}đ từ tài khoản ${req.user.name}`,
                    {
                        type: CONSTANT_NOTIFICATION.CHARGE_MONEY_SUCCESS,
                    })
            }
            const save_action = await Promise.all([save_trans_sending, save_sending, promise_save_driver, promise_save_transaction])

            res.status(200).send({ err: false, data: "success" })

        })
        session.endSession();


    } catch (error) {
        console.log("error", error)
        session.endSession();
        res.status(400).send({ err: true, error })


    }
})

charge_router.post('/charge/request', authWithoutData, async (req, res) => {
    try {
        const { amount, payment_method, image, content } = req.body;
        const chargeRequest = new Charge({ driver_id: req._id, amount, payment_method, image, content, time: Date.now(), status: status_charge.REQUESTING })
        await chargeRequest.save()

        res.status(200).send({ err: false, data: chargeRequest })
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})
// recharge request
charge_router.post('/charge/request/again', authWithoutData, async (req, res) => {
    try {
        const { id, image } = req.query;
        const chargeRequest = await Charge.findOneAndUpdate({ _id: id }, { status: status_charge.REQUESTING, image: image }, { new: true })

        res.status(200).send({ err: false, data: chargeRequest })
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})
//cancel request charge
charge_router.post('/charge/cancel', authWithoutData, async (req, res) => {
    try {
        const { id } = req.query;
        const data = await Charge.findOneAndUpdate({ _id: id }, { status: status_charge.CANCEL }, { new: true })

        res.status(200).send({ err: false, data: data })
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})
// lấy request của bản thân
charge_router.get('/charge/request', authWithoutData, async (req, res) => {
    try {
        const data = await Charge.findOne({ driver_id: req._id, $or: [{ status: status_charge.REQUESTING }, { status: status_charge.DECLINE }] }).sort({ $natural: -1 })

        res.status(200).send({ err: false, data: data })
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})





module.exports = charge_router;
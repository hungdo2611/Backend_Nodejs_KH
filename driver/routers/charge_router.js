const express = require('express')
const Charge = require('../models/charge')
const { auth, authWithoutData } = require('../middleware/auth')
const charge_router = express.Router()
const status_charge = {
    REQUESTING: 'REQUESTING',
    ACCEPT: 'ACCEPT',
    DECLINE: 'DECLINE',
    CANCEL: 'CANCEL'
}

const CONSTANT_PAYMENT = {
    BANK: 'BANK',
    VIETTEL_PAY: 'VIETTEL_PAY'
}
// request charge
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
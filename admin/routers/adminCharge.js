const express = require('express')
const { auth, authWithoutData } = require('../middleware/auth')

const Charge = require('../../driver/models/charge')

const adminCharge = express.Router()
const mongoose = require('mongoose')
const Driver = require('../../driver/models/driver')
const Transaction = require('../../driver/models/transaction')
const { TYPE_TRANSACTION, CONSTANT_NOTIFICATION } = require('../../constant')
const { pushNotificationTo_User } = require('../../utils/index')
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

adminCharge.get('/admin/charge', authWithoutData, async (req, res) => {
    try {
        const { page_number, page_size } = req.query;
        if (!page_number || !page_size) {
            res.status(400).send({ err: true, data: 'missing param' })
        }
        const lst_charge = await Charge.paginate(
            { status: status_charge.REQUESTING },
            {
                populate: { path: 'driver_id', select: "phone avatar name" },
                page: page_number,
                limit: page_size,
                forceCountFn: true,
                sort: { $natural: -1 },
            });
        res.status(200).send({ data: lst_charge.docs, err: false, total: lst_charge.totalDocs })


    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})
adminCharge.post('/admin/charge/decline', authWithoutData, async (req, res) => {
    try {
        const { id } = req.query;
        let crr_charge = await Charge.findOne({ _id: id }).populate('driver_id', 'device_token');
        crr_charge.status = status_charge.DECLINE;
        await crr_charge.save();
        pushNotificationTo_User(
            [crr_charge.driver_id.device_token],
            'Yêu cầu nạp tiền thất bại', 'Hãy kiểm tra lại thông tin hoặc yêu cầu hỗ trợ nhé',
            {
                type: CONSTANT_NOTIFICATION.CHARGE_MONEY_FAILED
            })
        res.status(200).send({ err: false, data: "success" })

    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })


    }
})

adminCharge.post('/admin/charge/accept', authWithoutData, async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { id } = req.query;
        await session.withTransaction(async () => {
            const opts = { session, returnOriginal: false };
            let crr_charge = await Charge.findOne({ _id: id });
            crr_charge.status = status_charge.ACCEPT;
            let driver = await Driver.findOne({ _id: crr_charge.driver_id });
            driver.point = driver.point + crr_charge.amount;
            const transaction_charge = new Transaction({
                driver_id: driver._id,
                time: (Date.now() / 1000) >> 0,
                type: TYPE_TRANSACTION.ADD_CHARGE_MONEY,
                content: `Cộng tiền nạp vào tài khoản`,
                amount: crr_charge.amount
            })
            const promise_save_charge = crr_charge.save(opts);
            const promise_save_driver = driver.save(opts);
            const promise_save_transaction = transaction_charge.save(opts)
            const save_action = await Promise.all([promise_save_charge, promise_save_driver, promise_save_transaction])
            pushNotificationTo_User(
                [driver.device_token],
                'Yêu cầu nạp tiền thành công', 'Hãy kiểm tra tài khoản ngay nhé',
                {
                    type: CONSTANT_NOTIFICATION.CHARGE_MONEY_SUCCESS
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

module.exports = adminCharge;
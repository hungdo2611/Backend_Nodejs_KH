const express = require('express')
const Admin = require('../models/user')
const { auth, authWithoutData } = require('../middleware/auth')
const parsePhoneNumber = require('libphonenumber-js')

const Customer = require('../../customer/models/user')
const Booking = require('../../customer/models/booking')
const { CONSTANT_STATUS_BOOKING, CONSTANT_NOTIFICATION } = require('../../constant')

const adminCustomer = express.Router()

adminCustomer.get('/admin/customer', authWithoutData, async (req, res) => {
    try {
        const { page_number, page_size } = req.query;
        if (!page_number || !page_size) {
            res.status(400).send({ err: true, data: 'missing param' })
        }
        const lst_customer = await Customer.paginate(
            {},
            {
                page: page_number,
                limit: page_size,
                forceCountFn: true,
                sort: { $natural: -1 },
                projection: { password: 0, }
            });
        res.status(200).send({ data: lst_customer.docs, err: false, total: lst_customer.totalDocs })


    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }

})
adminCustomer.get('/admin/customer/info', authWithoutData, async (req, res) => {
    try {
        const { phone } = req.query;
        if (!phone) {
            res.status(400).send({ err: true, data: 'missing param' })
        }
        const phoneNumber = parsePhoneNumber(phone, 'VN')

        const customer = await Customer.findOne({ phone: phoneNumber.number }, { password: 0, });

        res.status(200).send({ data: customer, err: false })


    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }

})
adminCustomer.get('/admin/customer/recentBooking', authWithoutData, async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            res.status(400).send({ err: true, data: 'missing param' })
        }

        const lst_booking = await Booking.paginate(
            { cus_id: id },
            {
                populate: { path: 'driver_id', select: "phone avatar name" },
                page: 1,
                limit: 10,
                forceCountFn: true,
                sort: { $natural: -1 },
            });


        res.status(200).send({ data: lst_booking.docs, err: false, total: lst_booking.totalDocs })


    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }

})
adminCustomer.post('/admin/cancel/booking', authWithoutData, async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            res.status(400).send({ err: true, data: 'missing param' })
        }

        const update = await Booking.findOneAndUpdate({ _id: id }, { status: CONSTANT_STATUS_BOOKING.USER_CANCEL }, { new: true }).populate('cus_id', 'device_token');
        pushNotificationTo_User(
            [update?.cus_id?.device_token],
            'Chuyến đi đã được huỷ',
            'Chuyến đi đã được huỷ theo yêu cầu của bạn',
            {
                type: CONSTANT_NOTIFICATION.SYSTEM_CANCLE_BOOKING
            })

        res.status(200).send({ data: 'success', err: false })


    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }

})
adminCustomer.post('/admin/finish/booking', authWithoutData, async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            res.status(400).send({ err: true, data: 'missing param' })
        }

        const update = await Booking.findOneAndUpdate({ _id: id }, { status: CONSTANT_STATUS_BOOKING.END }, { new: true }).populate('cus_id', 'device_token');
        pushNotificationTo_User(
            [update?.cus_id?.device_token],
            'Chuyến đi đã kết thúc',
            'Chuyến đi đã kết thúc theo yêu cầu của bạn',
            {
                type: CONSTANT_NOTIFICATION.DRIVER_DROP_OFF_CUSTOMER
            })

        res.status(200).send({ data: 'success', err: false })


    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }

})
module.exports = adminCustomer;
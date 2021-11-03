const express = require('express')
const Admin = require('../models/user')
const auth = require('../middleware/auth')
const parsePhoneNumber = require('libphonenumber-js')

const Customer = require('../../customer/models/user')
const Booking = require('../../customer/models/booking')

const adminCustomer = express.Router()

adminCustomer.get('/admin/customer', auth, async (req, res) => {
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
                projection: { tokens: 0, password: 0, }
            });
        res.status(200).send({ data: lst_customer.docs, err: false, total: lst_customer.totalDocs })


    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }

})
adminCustomer.get('/admin/customer/info', auth, async (req, res) => {
    try {
        const { phone } = req.query;
        if (!phone) {
            res.status(400).send({ err: true, data: 'missing param' })
        }
        const phoneNumber = parsePhoneNumber(phone, 'VN')

        const customer = await Customer.findOne({ phone: phoneNumber.number }, { tokens: 0, password: 0, });

        res.status(200).send({ data: customer, err: false })


    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }

})
adminCustomer.get('/admin/customer/recentBooking', auth, async (req, res) => {
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

module.exports = adminCustomer;
const express = require('express')
const Booking = require('../models/booking')
const Journeys = require('../../driver/models/journeys')
const auth = require('../middleware/auth')
const { findingJouneys } = require('../worker/workerBooking')
require('../worker/workerBookingProcess')
const routerBooking = express.Router()







routerBooking.post('/booking/create', auth, async (req, res) => {
    // Create a new user
    try {

        const body_booking = {
            cus_id: 2,
            from: {
                lat: 21.113291599660474,
                lng: 105.76266482457362,
                address: "Pham van dong",
                province: 'HN'
            },
            to: {
                lat: 21.306707419857357,
                lng: 105.61272817310709,
                address: "Quảng trường HCM",
                province: 'VP'
            },
            distance: 36300,
            status: 'FINDING',

        };

        Journeys.find({ 'to.province': 'VP' }, (err, data) => {
            console.log("Journeys", data)
        })
        const booking = new Booking(body_booking);
        await booking.save();
        res.status(201).send({ err: false, data: 'Success' });
    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})


module.exports = routerBooking;
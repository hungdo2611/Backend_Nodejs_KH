const express = require('express')
const Booking = require('../models/booking')
const auth = require('../middleware/auth')

const routerBooking = express.Router()






routerBooking.post('/booking/create', auth, async (req, res) => {
    // Create a new user
    try {

        const booking = new Booking(body)
        console.log("user", req.body)
        await booking.save()
        res.status(201).send({ err: false, data: 'Success' })
    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})


module.exports = routerBooking;
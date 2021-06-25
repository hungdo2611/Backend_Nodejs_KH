const express = require('express')
const Booking = require('../models/booking')
const Journeys = require('../../driver/models/journeys')
const auth = require('../middleware/auth')
const { findingJouneys } = require('../worker/workerBooking')
require('../worker/workerBookingProcess')
const routerBooking = express.Router()

const geolib = require('geolib');


function getMinDistance(origin, route) {
    let arrRoute = []
    route.forEach(data => {
        arrRoute.push({ latitude: data.start_loc.lat, longitude: data.start_loc.lng });
        arrRoute.push({ latitude: data.end_loc.lat, longitude: data.end_loc.lng });
    })
    let nearestPoint = geolib.findNearest(origin, arrRoute);
    let lstRouteNearest = route.filter(vl => {
        return (vl.start_loc.lat == nearestPoint.latitude && vl.start_loc.lng == nearestPoint.longitude) || (vl.end_loc.lat == nearestPoint.latitude && vl.end_loc.lng == nearestPoint.longitude)
    })
    let minDistance;

    lstRouteNearest.forEach(data => {
        let distance = geolib.getDistanceFromLine(
            origin,
            { latitude: data.start_loc.lat, longitude: data.start_loc.lng },
            { latitude: data.end_loc.lat, longitude: data.end_loc.lng },
        );
        if (minDistance) {
            if (distance < minDistance) {
                minDistance = distance
            }
        } else {
            minDistance = distance
        }
    })
    return minDistance

}



routerBooking.post('/booking/create', auth, async (req, res) => {
    // Create a new user
    try {

        const body_booking = {
            cus_id: 2,
            from: {
                lat: 21.09085279760941,
                lng: 105.78847279687488,
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
            data.forEach(journey => {

                let minDistance = getMinDistance({ latitude: body_booking.from.lat, longitude: body_booking.from.lng }, journey.routes)
                console.log('minDistance', minDistance)
            })
        })
        // const booking = new Booking(body_booking);
        // await booking.save();
        res.status(201).send({ err: false, data: 'Success' });
    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})


module.exports = routerBooking;
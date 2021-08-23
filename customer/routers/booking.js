const express = require('express')
const Booking = require('../models/booking')
const Journeys = require('../../driver/models/journeys')
const auth = require('../middleware/auth')
const { findingJouneys } = require('../worker/workerBooking')
require('../worker/workerBookingProcess')
const routerBooking = express.Router()
const mongoose = require('mongoose');

const geolib = require('geolib');
const { request } = require('express')
const Driver = require('../../driver/models/driver')
const { pushNotificationTo_Driver } = require('../../driver/routers/driver')
const { CONSTANT_NOTIFICATION, CONSTANT_STATUS_BOOKING } = require('../../constant/index')

const STATUS_BOOKING = {
    FINDING: 'FINDING',
    PROCESS: 'PROCESS',
    DONE: 'DONE',
    CANCEL: 'CANCEL'
}

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
            _id: new mongoose.Types.ObjectId(),
            cus_id: req.user._id,
            from: {
                "loc": {
                    "type": "Point",
                    "coordinates": [req.body.from.lng, req.body.from.lat]
                },

                address: req.body.from.address,
            },
            to: {
                "loc": {
                    "type": "Point",
                    "coordinates": [req.body.to.lng, req.body.to.lat]
                },
                address: req.body.to.address,
            },
            distance: req.body.distance,
            status: CONSTANT_STATUS_BOOKING.FINDING_DRIVER,
            seat: req.body.seat,
            time_start: req.body.time_start,

        };
        const booking = new Booking(body_booking);
        await booking.save();

        const { lst_devicetoken } = req.body;
        console.log('lst_devicetoken', lst_devicetoken)
        pushNotificationTo_Driver(
            lst_devicetoken,
            'Có hành khách muốn đi chuyến xe của bạn',
            'Hãy xác nhận bạn có thể đón khách hay không nhé ^^',
            {
                type: CONSTANT_NOTIFICATION.CUSTOMER_REQUEST_TO_DRIVER,
                booking_id: booking._id.toString()
            })

        res.status(200).send({ err: false, data: "success" })
    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})
routerBooking.post('/booking/request_to_driver', auth, async (req, res) => {
    // Create a new user
    try {
        const { lst_devicetoken, booking_id } = request.body;
        if (!Array.isArray(lst_id)) {
            res.status(400).send({ err: false, data: "Wrong format" });
        }
        pushNotificationTo_Driver(
            lst_devicetoken,
            'Có hành khách muốn đi chuyến xe của bạn',
            'Hãy xác nhận bạn có thể đón khách hay không nhé ^^',
            {
                type: CONSTANT_NOTIFICATION.CUSTOMER_REQUEST_TO_DRIVER,
                data: { booking_id: booking_id }
            })
        const dataDriver = await Driver.find({
            _id: {
                $in: lst_id
            }
        })


        res.status(201).send({ err: false, data: dataJourney });
    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})
routerBooking.post('/booking/finding/driver', auth, async (req, res) => {
    // Create a new user
    try {
        const body_booking = {
            from: {
                "loc": {
                    "type": "Point",
                    "coordinates": [req.body.from.lng, req.body.from.lat]
                },
            },
            to: {
                "loc": {
                    "type": "Point",
                    "coordinates": [req.body.to.lng, req.body.to.lat]
                },
            },

        };
        const dataJourney = await Journeys.find({
            routes: {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: body_booking.from.loc.coordinates
                    },
                    $maxDistance: 2000
                }
            },
            routes: {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: body_booking.to.loc.coordinates
                    },
                    $maxDistance: 5000
                }
            },
            time_end: { $gte: (Date.now() / 1000) >> 0 }
        }).populate('driver_id', "phone avatar name device_token");
        console.log('dataJourney', dataJourney)
        res.status(201).send({ err: false, data: dataJourney });
    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})


module.exports = routerBooking;
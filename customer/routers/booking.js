const express = require('express')
const Booking = require('../models/booking')
const Journeys = require('../../driver/models/journeys')
const auth = require('../middleware/auth')
const authDriver = require('../../driver/middleware/auth')
const { findingJouneys } = require('../worker/workerBooking')
require('../worker/workerBookingProcess')
const routerBooking = express.Router()
const mongoose = require('mongoose');

const geolib = require('geolib');
const { request } = require('express')
const Driver = require('../../driver/models/driver')
const { pushNotificationTo_User } = require('../../utils/index')
const { CONSTANT_NOTIFICATION, CONSTANT_STATUS_BOOKING } = require('../../constant/index')
// Booking.deleteMany({}, (res) => {
//     console.log('res delete', res)
// })

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

routerBooking.post('/booking/cancel', auth, async (req, res) => {
    try {
        const { id, reason } = req.body
        const booking = await Booking.findOne({
            _id: id
        }).populate("cus_id", 'phone name avatar')
        if (!booking) {
            res.status(200).send({ err: true, data: "booking not found" })
            return
        }
        if (booking && booking.status != CONSTANT_STATUS_BOOKING.FINDING_DRIVER) {
            res.status(200).send({ err: true, message: "Không thể huỷ! Chuyến đã có tài xế nhận", data: booking })
            return
        }
        booking.reason = reason;
        booking.status = CONSTANT_STATUS_BOOKING.USER_CANCEL;
        await booking.save();
        res.status(200).send({ err: false, data: booking })
    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})
routerBooking.get('/booking/driver/getdatabooking', authDriver.auth, async (req, res) => {
    try {

        const booking_id = req.query.booking_id
        console.log('booking_id', booking_id)
        const databooking = await Booking.findOne({ _id: booking_id }).populate("cus_id", 'phone name avatar')
        res.status(200).send({ err: false, data: databooking })

    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})
routerBooking.post('/booking/finish/:booking_id', auth, async (req, res) => {
    try {
        let booking_id = req.params.booking_id;

        const currentBooking = await Booking.findOne({ _id: booking_id, });
        if (currentBooking.status === CONSTANT_STATUS_BOOKING.PROCESSING) {
            currentBooking.status = CONSTANT_STATUS_BOOKING.END;
            await currentBooking.save();
            res.status(200).send({ err: false, data: currentBooking })
            return
        }
        res.status(200).send({ err: true, data: 'Đã có lỗi xảy ra. Vui lòng thử lại sau' })

    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})
routerBooking.get('/booking/current', auth, async (req, res) => {
    try {
        const currentBooking = await Booking
            .findOne({ cus_id: req.user._id })
            .or([{ 'status': CONSTANT_STATUS_BOOKING.FINDING_DRIVER }, { 'status': CONSTANT_STATUS_BOOKING.PROCESSING }, { 'status': CONSTANT_STATUS_BOOKING.WAITING_DRIVER }])
            .sort({ $natural: -1 })
            .populate('driver_id', "phone avatar name").populate('journey_id', 'line_string from to');
        res.status(200).send({ err: false, data: currentBooking })
    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})

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
            range_price: req.body.range_price,
            line_string: req.body.line_string,
            booking_type: req.body.booking_type,
            orderInfo: req.body.orderInfo
        };
        const booking = new Booking(body_booking);
        await booking.save();

        const { lst_devicetoken } = req.body;
        console.log('lst_devicetoken', lst_devicetoken)
        pushNotificationTo_User(
            lst_devicetoken,
            'Có hành khách muốn đi chuyến xe của bạn',
            'Hãy xác nhận bạn có thể đón khách hay không nhé ^^',
            {
                type: CONSTANT_NOTIFICATION.CUSTOMER_REQUEST_TO_DRIVER,
                booking_id: booking._id.toString()
            })

        res.status(200).send({ err: false, data: booking })
    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})
pushNotificationTo_User(
    ["f4hWrSKDYkI8u81l8HY88V:APA91bEzDWFcLKH8RNe1802c0xzFkETfuf3cbYf00ZqwSLp8o1-TQLea_vo7ShK-Ylso2WRoxhxZxGsjjPtsOqGzlncsEJGDUwNNtv4z_qMzTiHUgrRltrMNAgVPQnZ0jI3PSQeKGo0U"],
    'Có hành khách muốn đi chuyến xe của bạn',
    'Hãy xác nhận bạn có thể đón khách hay không nhé ^^',
    {
        type: CONSTANT_NOTIFICATION.CUSTOMER_REQUEST_TO_DRIVER,
        booking_id: "612e4d4437effaeb679e5ac0"
    })

routerBooking.post('/booking/finding/driver', auth, async (req, res) => {
    // Create a new user
    try {
        console.log("hello")
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
            time_end: { $gte: (Date.now() / 1000) >> 0 },
            journey_type: req.body.journey_type,
            allow_Customer: true,
        }).populate('driver_id', "phone avatar name device_token");
        console.log('dataJourney', dataJourney)
        res.status(201).send({ err: false, data: dataJourney });
    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})
routerBooking.post('/booking/finding/driver_delivery', auth, async (req, res) => {
    // Create a new user
    try {
        console.log("hello")
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
            time_end: { $gte: (Date.now() / 1000) >> 0 },
            journey_type: req.body.journey_type,
            allow_Shipping: true,

        }).populate('driver_id', "phone avatar name device_token");
        console.log('dataJourney', dataJourney)
        res.status(201).send({ err: false, data: dataJourney });
    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})


module.exports = routerBooking;
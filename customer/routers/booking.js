const express = require('express')
const Booking = require('../models/booking')
const Journeys = require('../../driver/models/journeys')
const Notification_driver = require('../../driver/models/notification')
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
const { CONSTANT_NOTIFICATION, CONSTANT_STATUS_BOOKING, CONSTANT_STATUS_JOUNEYS, CONSTANT_TYPE_BOOKING } = require('../../constant/index')
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
        res.status(400).send({ err: true, error })
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
        res.status(400).send({ err: true, error })

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
        res.status(400).send({ err: true, error })

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
        res.status(400).send({ err: true, error })

    }
})
routerBooking.get('/booking/state', auth, async (req, res) => {
    try {
        const { _id } = req.query
        const currentBooking = await Booking
            .findOne({ _id: _id })
            .populate('driver_id', "phone avatar name").populate('journey_id', 'line_string from to');
        res.status(200).send({ err: false, data: currentBooking })
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

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
            orderInfo: req.body.orderInfo,
            coupon_code: req.body.coupon_code
        };
        const booking = new Booking(body_booking);
        await booking.save();
        if (req.body.coupon_code) {
            if (req.user.coupon_used) {
                req.user.coupon_used = [...req.user.coupon_used, req.body.coupon_code]
            } else {
                req.user.coupon_used = [req.body.coupon_code]
            }
            await req.user.save()

        }

        const { lst_devicetoken, list_driverId } = req.body;
        pushNotificationTo_User(
            lst_devicetoken,
            'Có hành khách yêu cầu',
            'Hãy xác nhận bạn có thể đón khách hay không nhé ^^',
            {
                type: CONSTANT_NOTIFICATION.CUSTOMER_REQUEST_TO_DRIVER,
                booking_id: booking._id.toString()
            })

        res.status(200).send({ err: false, data: booking })
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})
// pushNotificationTo_User(
//     ["f4hWrSKDYkI8u81l8HY88V:APA91bEzDWFcLKH8RNe1802c0xzFkETfuf3cbYf00ZqwSLp8o1-TQLea_vo7ShK-Ylso2WRoxhxZxGsjjPtsOqGzlncsEJGDUwNNtv4z_qMzTiHUgrRltrMNAgVPQnZ0jI3PSQeKGo0U"],
//     'Có hành khách muốn đi chuyến xe của bạn',
//     'Hãy xác nhận bạn có thể đón khách hay không nhé ^^',
//     {
//         type: CONSTANT_NOTIFICATION.CUSTOMER_REQUEST_TO_DRIVER,
//         booking_id: "612e4d4437effaeb679e5ac0"
//     })

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
            status: { $ne: CONSTANT_STATUS_JOUNEYS.END }
        }).populate('driver_id', "phone avatar name device_token");
        console.log('dataJourney', dataJourney)
        res.status(201).send({ err: false, data: dataJourney });
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})
routerBooking.post('/booking/finding/driver_delivery', auth, async (req, res) => {
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
            time_end: { $gte: (Date.now() / 1000) >> 0 },
            journey_type: req.body.journey_type,
            allow_Shipping: true,
            status: { $ne: CONSTANT_STATUS_JOUNEYS.END }
        }).populate('driver_id', "phone avatar name device_token");
        console.log('dataJourney', dataJourney)
        res.status(201).send({ err: false, data: dataJourney });
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})
routerBooking.post('/booking/near/user', auth, async (req, res) => {
    // Create a new user
    try {
        const { page_number, page_size } = req.query;
        if (!page_number || !page_size) {
            res.status(400).send({ err: true, data: 'missing param' })
        }
        const body = {
            location: {
                "loc": {
                    "type": "Point",
                    "coordinates": [req.body.location.lng, req.body.location.lat]
                },
            },
        };
        const dataJourney = await Journeys.paginate({
            routes: {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: body.location.loc.coordinates
                    },
                    $maxDistance: 6000
                }
            },
            status: CONSTANT_STATUS_JOUNEYS.WAITING,
            time_end: { $gte: (Date.now() / 1000) >> 0 },
        }, { populate: { path: 'driver_id', select: "phone avatar name device_token" }, page: page_number, limit: page_size, forceCountFn: true });
        res.status(200).send({ err: false, data: dataJourney.docs, total: dataJourney.totalDocs })
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})
// get history booking
routerBooking.get('/booking/history', auth, async (req, res) => {
    try {
        const { page_nunmber, page_size, type } = req.query;
        console.log("req.query", page_nunmber)
        if (!page_nunmber || !page_size) {
            console.log("abcd")
            res.status(400).send({ err: true, data: 'missing param' })
            return
        }
        if (type) {
            if (type === 'delivery') {
                const history = await Booking.paginate({ cus_id: req.user._id, $or: [{ status: CONSTANT_TYPE_BOOKING.COACH_DELIVERY_CAR }, { status: CONSTANT_TYPE_BOOKING.HYBIRD_DELIVERY_CAR }] }, { populate: { path: 'driver_id', select: "phone avatar name device_token" }, page: page_nunmber, limit: page_size, forceCountFn: true, sort: { $natural: -1 } });
                console.log("history2", history)

                res.status(200).send({ err: false, data: history.docs, total: history.totalDocs })
                return
            }
            const history = await Booking.paginate({ cus_id: req.user._id, status: type }, { populate: { path: 'driver_id', select: "phone avatar name device_token" }, page: page_nunmber, limit: page_size, forceCountFn: true, sort: { $natural: -1 } });
            console.log("history1", history)

            res.status(200).send({ err: false, data: history.docs, total: history.totalDocs })
            return
        }
        const history = await Booking.paginate({ cus_id: req.user._id, }, { populate: { path: 'driver_id', select: "phone avatar name device_token" }, page: page_nunmber, limit: page_size, forceCountFn: true, sort: { $natural: -1 } });
        console.log("history", history)
        res.status(200).send({ err: false, data: history.docs, total: history.totalDocs })
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})

module.exports = routerBooking;
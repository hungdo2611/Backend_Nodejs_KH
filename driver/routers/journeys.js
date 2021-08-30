const express = require('express')
const Journeys = require('../models/journeys')
const auth = require('../middleware/auth')
const { CONSTANT_STATUS_JOUNEYS } = require('../../constant/index')
const Booking = require('../../customer/models/booking')
const { CONSTANT_STATUS_BOOKING, SERVICE_CHARGE, TYPE_TRANSACTION } = require('../../constant')
const Journey_router = express.Router()

function convertData(data) {
    const arr = data.response.route[0].leg[0].maneuver
    let route = arr.map(vl => {
        return [vl.position.longitude, vl.position.latitude]
        // return {
        //     distance: vl.length,
        //     "loc": {
        //         "type": "LineString",
        //         "coordinates": [vl.position.longitude, vl.position.latitude]
        //     },
        // }
    })
    return route
}
// accept booking 
Journey_router.get('/journey/accept/booking', auth, async (req, res) => {
    try {
        const { booking_id, journey_id, price } = req.body
        if (!booking_id || !journey_id || !price) {
            res.status(200).send({ err: true, data: 'missing param' })
        }
        //
        let user = req.user;
        const formatPrice = Math.abs(price);
        const value_service_charge = formatPrice * SERVICE_CHARGE;
        if (user.point < value_service_charge) {
            res.status(200).send({ err: true, data: null, message: 'Số dự coin không đủ để nhận chuyến đi này. Vui lòng nạp thêm coin để có thể nhận thêm chuyến đi này' })
            return
        }
        user.point = user.point - formatPrice * SERVICE_CHARGE;
        user.lst_transaction = [...user.lst_transaction, {
            time: (Date.now() / 1000) >> 0,
            type: TYPE_TRANSACTION.ACCEPT_BOOKING,
            content: `Trừ coin để nhận chuyến`,
            value: value_service_charge
        }]
        const promise_save_user = user.save();
        //
        let promise_booking = Booking.findOne({ _id: booking_id });
        let promise_journey = Journeys.findOne({ _id: journey_id })
        const all_data = await Promise.all([promise_booking, promise_journey]);
        const data_booking = all_data[0];
        const data_journeys = all_data[1];
        if (data_booking.status != CONSTANT_STATUS_BOOKING.FINDING_DRIVER) {
            res.status(200).send({ err: true, data: null, message: 'Chuyến đi này đã có tài xế khác nhận rồi. Hãy nhanh tay nhận chuyến ở lần sau nhé ^^' })
            return
        }
        if (data_journeys.status === CONSTANT_STATUS_JOUNEYS.WAITING || data_journeys.status === CONSTANT_STATUS_JOUNEYS.STARTED) {
            res.status(200).send({ err: true, data: null, message: 'Bạn không thể nhận chuyến đi này vì hành trình của bạn đã kết thúc' })
            return
        }
        // set data for booking
        data_booking.status = CONSTANT_STATUS_BOOKING.PROCESSING;
        data_booking.journey_id = journey_id;
        data_booking.driver_id = req.user._id
        const promise_save_booking = data_booking.save();
        //set data for journey
        data_journeys.lst_booking_id = [...data_journeys.lst_booking_id, booking_id]
        const promise_save_journey = data_journeys.save();
        const save_action = await Promise.all([promise_save_user, promise_save_booking, promise_save_journey])
        res.status(200).send({ err: false, data: 'success' })
    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})
// get current journey
Journey_router.get('/journey/current', auth, async (req, res) => {
    try {
        const currentJourney = await Journeys.findOne({ driver_id: req.user._id }).or([{ 'status': CONSTANT_STATUS_JOUNEYS.WAITING }, { 'status': CONSTANT_STATUS_JOUNEYS.STARTED }]).sort({ $natural: -1 })
        res.status(200).send({ err: false, data: currentJourney })
    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})
//register api
Journey_router.post('/journey/create', auth, async (req, res) => {
    // Create journey
    try {
        /*
        const body ={
            driver_id: req.user._id,
            from: {
                "loc": {
                    "type": "Point",
                    "coordinates": [105.7780682087555, 21.027331696466383]
                },
                // lat: 20.96482878714222,
                // lng: 105.84217557982575,
                address: "Bến xe Mỹ Đình",
                // province: 'HN'
            },
            {
                "loc": {
                    "type": "Point",
                    "coordinates": [105.63181272653117, 21.292436138115065]
                },
                // lat: 21.306707419857357,
                // lng: 105.61272817310709,
                address: "Big C Vĩnh Phúc",
                // province: 'VP'
            },
            distance: 44000,

            time_start: 1623293947000,
            time_end: 1625885947000,
            allow_Shipping:true,
            price: [
            ],
            price_shipping:[

            ]
            routes: {
                "type": "LineString",
                "coordinates": newRoutes
            },
        }
        */
        console.log("req.body", req.body)
        const body = {
            driver_id: req.user._id,
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
            allow_Shipping: req.body.allow_Shipping,
            distance: req.body.distance,
            time_start: req.body.time_start,
            time_end: req.body.time_end,
            price: req.body.price,
            price_shipping: req.body.price_shipping,
            routes: {
                "type": "LineString",
                "coordinates": req.body.route
            },
        }
        const journey = new Journeys(body)
        await journey.save()
        res.status(200).send({ err: false, data: journey })
    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})



module.exports = Journey_router;

const express = require('express')
const Journeys = require('../models/journeys')
const auth = require('../middleware/auth')
const { CONSTANT_STATUS_JOUNEYS } = require('../../constant/index')
const Booking = require('../../customer/models/booking')
const { pushNotificationTo_User } = require('../../utils')
const { CONSTANT_STATUS_BOOKING, SERVICE_CHARGE, TYPE_TRANSACTION, CONSTANT_NOTIFICATION } = require('../../constant')
const Journey_router = express.Router()
const geolib = require('geolib');
const { request } = require('express')
function getPointNearest(minValue, userCoord, Arr) {
    console.log("Arr", Arr)
    console.log("userCoord", userCoord)

    console.log("mindistance", minValue)
    const centerPoint = geolib.getCenter(Arr);
    const newDistance = geolib.getDistance(userCoord, centerPoint);
    console.log("newDistance", newDistance)

    if (newDistance > minValue + 100) {
        const distance_from_1 = geolib.getDistance(userCoord, Arr[0]);
        const distance_from_2 = geolib.getDistance(userCoord, Arr[1]);
        const newPoint = distance_from_1 < distance_from_2 ? Arr[0] : Arr[1];
        return getPointNearest(minValue, userCoord, [centerPoint, newPoint])
    } else {
        return centerPoint;
    }
}

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
//point pick suggestion for coach
Journey_router.post('/journey/point/suggestion', auth, async (req, res) => {
    try {
        const { userPoint, lst_coord } = req.body;
        console.log("userPoint", userPoint)
        let lst_coord_format = []
        lst_coord.coordinates.map((coord, index) => {
            if (index < lst_coord.coordinates.length - 1) {
                const nextCoord = lst_coord.coordinates[index + 1];
                const item = [{
                    latitude: coord[1],
                    longitude: coord[0]
                },
                {
                    latitude: nextCoord[1],
                    longitude: nextCoord[0]
                }
                ]
                lst_coord_format.push(item);
            }
        })
        let minDistance = 0;
        let minIndex = 0;
        lst_coord_format.map((route, index) => {
            let distance = geolib.getDistanceFromLine(
                { latitude: userPoint.coordinates[1], longitude: userPoint.coordinates[0] },
                route[0],
                route[1],
            );
            console.log('distance', distance)
            if (minDistance == 0) {
                minDistance = distance;
                minIndex = 0
            } else {
                if (minDistance > distance) {
                    minDistance = distance;
                    minIndex = index
                }
            }
        })
        const nearestPoint = getPointNearest(
            minDistance,
            { latitude: userPoint.coordinates[1], longitude: userPoint.coordinates[0] },
            lst_coord_format[minIndex]
        )


        res.status(200).send({ err: false, data: nearestPoint })

    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})
// pick up customer 


Journey_router.post('/journey/finish/:journey_id', auth, async (req, res) => {
    try {
        const journey_id = req.params.journey_id;

        const journey = await Journeys.findOneAndUpdate({ _id: journey_id, }, {
            status: CONSTANT_STATUS_JOUNEYS.END
        }, {
            new: true
        });
        res.status(200).send({ err: false, data: journey })
    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})

Journey_router.post('/journey/start/:journey_id', auth, async (req, res) => {
    try {
        const journey_id = req.params.journey_id;

        const journey = await Journeys.findOneAndUpdate({ _id: journey_id, }, {
            status: CONSTANT_STATUS_JOUNEYS.STARTED
        }, {
            new: true
        });
        res.status(200).send({ err: false, data: journey })


    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})

// accept booking 
Journey_router.post('/journey/pickup/customer', auth, async (req, res) => {
    try {
        const { booking_id, journey_id } = req.body;
        const promise_booking = Booking.findOneAndUpdate({ _id: booking_id }, { status: CONSTANT_STATUS_BOOKING.PROCESSING }).populate("cus_id", 'device_token');;
        let promise_journey = Journeys.findOne({ _id: journey_id });
        const all_data = await Promise.all([promise_booking, promise_journey]);
        let data_booking = all_data[0];
        let data_journeys = all_data[1];
        console.log("data_journeys.lst_pickup_point", data_journeys.lst_pickup_point)
        const index = data_journeys.lst_pickup_point.findIndex(dt => {
            return dt.booking_id == booking_id;
        })
        data_journeys.lst_pickup_point[index].isPick = true;
        await data_journeys.save();
        pushNotificationTo_User(
            [data_booking.cus_id.device_token],
            'Tài xế đã đến đón bạn', 'Hãy tận hưởng chuyến đi nhé ^^',
            {
                type: CONSTANT_NOTIFICATION.DRIVER_PICK_UP_CUSTOMER,
                journey_id: journey_id,
                booking_id: booking_id
            })
        res.status(200).send({ err: false, data: data_journeys })
    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }

})
Journey_router.post('/journey/accept/booking', auth, async (req, res) => {
    try {
        const { booking_id, journey_id, price, suggestion_pick } = req.body
        console.log("req.body", req.body)
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
        let promise_booking = Booking.findOne({ _id: booking_id }).populate("cus_id", 'device_token name phone avatar');
        let promise_journey = Journeys.findOne({ _id: journey_id });
        const all_data = await Promise.all([promise_booking, promise_journey]);
        const data_booking = all_data[0];
        const data_journeys = all_data[1];
        console.log("data_booking", data_booking)
        if (data_booking.status != CONSTANT_STATUS_BOOKING.FINDING_DRIVER) {
            res.status(200).send({ err: true, data: null, message: 'Chuyến đi này đã có tài xế khác nhận rồi. Hãy nhanh tay nhận chuyến ở lần sau nhé ^^' })
            return
        }
        if (data_journeys.status === CONSTANT_STATUS_JOUNEYS.END || data_journeys.status === CONSTANT_STATUS_JOUNEYS.CANCEL) {
            res.status(200).send({ err: true, data: null, message: 'Bạn không thể nhận chuyến đi này vì hành trình của bạn đã kết thúc' })
            return
        }
        // set data for booking
        data_booking.status = CONSTANT_STATUS_BOOKING.WAITING_DRIVER;
        data_booking.journey_id = journey_id;
        data_booking.driver_id = req.user._id;
        data_booking.price = price;
        data_booking.suggestion_pick = suggestion_pick;
        console.log("data_booking accept", data_booking)
        const promise_save_booking = data_booking.save();
        //set data for journey
        data_journeys.lst_booking_id = [...data_journeys.lst_booking_id, booking_id];
        const info_cus = { name: data_booking.cus_id.name, phone: data_booking.cus_id.phone, avatar: data_booking.cus_id.avatar, price: price, from: data_booking.from }
        data_journeys.lst_pickup_point = [...data_journeys.lst_pickup_point, { ...suggestion_pick, info: info_cus, isPick: false, booking_id: booking_id }]
        const promise_save_journey = data_journeys.save();
        const save_action = await Promise.all([promise_save_user, promise_save_booking, promise_save_journey])
        pushNotificationTo_User(
            [data_booking.cus_id.device_token],
            'Đã có tài xế nhận đón bạn', 'Hãy bấm vào đây để xem chi tiết chuyến xe',
            {
                type: CONSTANT_NOTIFICATION.DRIVER_ACEEPT_BOOKING,
                journey_id: journey_id,
                booking_id: booking_id
            })
        res.status(200).send({ err: false, data: { data_booking: 'success' } })
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
            line_string: req.body.line_string,
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

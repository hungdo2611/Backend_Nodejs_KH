const express = require('express')
const Booking = require('../models/booking')
const Journeys = require('../../driver/models/journeys')
const auth = require('../middleware/auth')
const { findingJouneys } = require('../worker/workerBooking')
require('../worker/workerBookingProcess')
const routerBooking = express.Router()

const geolib = require('geolib');

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
            status: 'FINDING',
            seat: req.body.seat,

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
            }
        }).populate('driver_id', "phone avatar");

        console.log('dataJourney', dataJourney[0])
        // Journeys.find({ 'to.province': 'VP' }, (err, data) => {
        //     data.forEach(journey => {

        //         let minDistance = getMinDistance({ latitude: body_booking.from.lat, longitude: body_booking.from.lng }, journey.routes)
        //         console.log('minDistance', minDistance)
        //     })
        // })
        // const booking = new Booking(body_booking);
        // await booking.save();
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
        const dataJourneyFrom = Journeys.find({
            routes: {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: body_booking.from.loc.coordinates
                    },
                    $maxDistance: 2000
                }
            },
        }).populate('driver_id', "phone avatar name");
        const dataJourneyTo = Journeys.find({
            routes: {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: body_booking.to.loc.coordinates
                    },
                    $maxDistance: 5000
                }
            }
        }).populate('driver_id', "phone avatar name");
        const allData = await Promise.all([dataJourneyFrom, dataJourneyTo,]);
        if (!allData[0] || !allData[1]) {
            res.status(201).send({ err: false, data: [] });
            return
        }
        console.log("allData0", allData[0])
        console.log("allData1", allData[1])

        const dataDriver = allData[0].filter(element => {
            const lst = allData[1]
            let index = lst.findIndex(vl => {
                return element.journey_id == vl.journey_id
            })
            if (index == -1) {
                return
            } else {
                return element
            }
        });
        console.log("dataDriver", dataDriver)
        const dataFilterTime = dataDriver.filter(dt => {
            return dt.time_end > (Date.now() / 1000) >> 0
        })


        // Journeys.find({ 'to.province': 'VP' }, (err, data) => {
        //     data.forEach(journey => {

        //         let minDistance = getMinDistance({ latitude: body_booking.from.lat, longitude: body_booking.from.lng }, journey.routes)
        //         console.log('minDistance', minDistance)
        //     })
        // })
        // const booking = new Booking(body_booking);
        // await booking.save();
        res.status(201).send({ err: false, data: dataFilterTime });
    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})

module.exports = routerBooking;
const express = require('express')
const Journeys = require('../models/journeys')
const auth = require('../middleware/auth')

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

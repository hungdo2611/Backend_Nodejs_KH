const express = require('express')
const Journeys = require('../models/journeys')
const auth = require('../middleware/auth')

const Journey_router = express.Router()



//register api
Journey_router.post('/journey/create', auth, async (req, res) => {
    // Create journey
    try {
        const body = {
            from: {
                lat: 21.02857990068944,
                lng: 105.7783223427145,
                address: "Bến xe mỹ đình"
            },
            to: {
                lat: 21.306707419857357,
                lng: 105.61272817310709,
                address: "Quảng trường HCM"
            },
            distance: 44,
            status: "STARTED",
            empty_seat: 40,
            time_start: 1623293947000,
            time_end: 1625885947000,
            price: [
                {
                    from: {
                        lat: 21.02857990068944,
                        lng: 105.7783223427145,
                        address: "Bến xe mỹ đình"
                    },
                    to: {
                        lat: 21.306707419857357,
                        lng: 105.61272817310709,
                        address: "Quảng trường HCM"
                    },
                    price: 50000
                },
                {
                    from: {
                        lat: 21.148302435534585,
                        lng: 105.77877527763206,
                        address: "Đông Anh - Hà Nội"
                    },
                    to: {
                        lat: 21.306707419857357,
                        lng: 105.61272817310709,
                        address: "Quảng trường HCM"
                    },
                    price: 30000
                }
            ]
        }
        const journey = new Journeys(body)
        await journey.save()
        res.status(200).send({ err: false, data: "success" })
    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})



module.exports = Journey_router;

const express = require('express')
const Journeys = require('../models/journeys')
const auth = require('../middleware/auth')

const Journey_router = express.Router()



//register api
Journey_router.post('/journey/create', auth, async (req, res) => {
    // Create journey
    try {
        const routes = "[{\"start_loc\":{\"lat\":21.028862,\"lng\":105.7783679},\"end_loc\":{\"lat\":21.0287623,\"lng\":105.7790763},\"distance\":74},{\"start_loc\":{\"lat\":21.0287623,\"lng\":105.7790763},\"end_loc\":{\"lat\":21.0284793,\"lng\":105.7809404},\"distance\":196},{\"start_loc\":{\"lat\":21.0284793,\"lng\":105.7809404},\"end_loc\":{\"lat\":21.0288404,\"lng\":105.7794414},\"distance\":175},{\"start_loc\":{\"lat\":21.0288404,\"lng\":105.7794414},\"end_loc\":{\"lat\":21.0331062,\"lng\":105.7801924},\"distance\":481},{\"start_loc\":{\"lat\":21.0331062,\"lng\":105.7801924},\"end_loc\":{\"lat\":21.0334276,\"lng\":105.7801293},\"distance\":36},{\"start_loc\":{\"lat\":21.0334276,\"lng\":105.7801293},\"end_loc\":{\"lat\":21.0835471,\"lng\":105.7879705},\"distance\":5692},{\"start_loc\":{\"lat\":21.0835471,\"lng\":105.7879705},\"end_loc\":{\"lat\":21.1142089,\"lng\":105.7851023},\"distance\":3482},{\"start_loc\":{\"lat\":21.1142089,\"lng\":105.7851023},\"end_loc\":{\"lat\":21.1589799,\"lng\":105.7794464},\"distance\":5085},{\"start_loc\":{\"lat\":21.1589799,\"lng\":105.7794464},\"end_loc\":{\"lat\":21.1598179,\"lng\":105.7824035},\"distance\":333},{\"start_loc\":{\"lat\":21.1598179,\"lng\":105.7824035},\"end_loc\":{\"lat\":21.1602994,\"lng\":105.784163},\"distance\":199},{\"start_loc\":{\"lat\":21.1602994,\"lng\":105.784163},\"end_loc\":{\"lat\":21.1605495,\"lng\":105.783699},\"distance\":77},{\"start_loc\":{\"lat\":21.1605495,\"lng\":105.783699},\"end_loc\":{\"lat\":21.1573596,\"lng\":105.7624753},\"distance\":2295},{\"start_loc\":{\"lat\":21.1573596,\"lng\":105.7624753},\"end_loc\":{\"lat\":21.1619879,\"lng\":105.7605368},\"distance\":583},{\"start_loc\":{\"lat\":21.1619879,\"lng\":105.7605368},\"end_loc\":{\"lat\":21.1689836,\"lng\":105.7624787},\"distance\":804},{\"start_loc\":{\"lat\":21.1689836,\"lng\":105.7624787},\"end_loc\":{\"lat\":21.2402175,\"lng\":105.6808949},\"distance\":13156},{\"start_loc\":{\"lat\":21.2402175,\"lng\":105.6808949},\"end_loc\":{\"lat\":21.2848669,\"lng\":105.6331031},\"distance\":7172},{\"start_loc\":{\"lat\":21.2848669,\"lng\":105.6331031},\"end_loc\":{\"lat\":21.3035916,\"lng\":105.6245686},\"distance\":2438},{\"start_loc\":{\"lat\":21.3035916,\"lng\":105.6245686},\"end_loc\":{\"lat\":21.3073177,\"lng\":105.6166971},\"distance\":965},{\"start_loc\":{\"lat\":21.3073177,\"lng\":105.6166971},\"end_loc\":{\"lat\":21.3077898,\"lng\":105.6138856},\"distance\":318},{\"start_loc\":{\"lat\":21.3077898,\"lng\":105.6138856},\"end_loc\":{\"lat\":21.306781,\"lng\":105.6137824},\"distance\":113}]"
        const body = {
            from: {
                lat: 20.96482878714222,
                lng: 105.84217557982575,
                address: "Bến xe nước ngầm",
                province: 'HN'
            },
            to: {
                lat: 21.306707419857357,
                lng: 105.61272817310709,
                address: "Quảng trường HCM",
                province: 'VP'
            },
            distance: 44000,
            status: "STARTED",
            empty_seat: 40,
            time_start: 1623293947000,
            time_end: 1625885947000,
            price: [
                {
                    from: {
                        lat: 21.02857990068944,
                        lng: 105.7783223427145,
                        address: "Bến xe mỹ đình",
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
            ],
            routes: JSON.parse(routes)
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

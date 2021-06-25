const express = require('express')
const Journeys = require('../models/journeys')
const auth = require('../middleware/auth')

const Journey_router = express.Router()



//register api
Journey_router.post('/journey/create', auth, async (req, res) => {
    // Create journey
    try {
        const routes = "[{\"start_loc\":{\"lat\":20.9645377,\"lng\":105.8420306},\"end_loc\":{\"lat\":20.9655519,\"lng\":105.8420455},\"distance\":113},{\"start_loc\":{\"lat\":20.9655519,\"lng\":105.8420455},\"end_loc\":{\"lat\":20.9655407,\"lng\":105.8481114},\"distance\":630},{\"start_loc\":{\"lat\":20.9655407,\"lng\":105.8481114},\"end_loc\":{\"lat\":20.9629889,\"lng\":105.8491046},\"distance\":339},{\"start_loc\":{\"lat\":20.9629889,\"lng\":105.8491046},\"end_loc\":{\"lat\":20.9638433,\"lng\":105.8473214},\"distance\":558},{\"start_loc\":{\"lat\":20.9638433,\"lng\":105.8473214},\"end_loc\":{\"lat\":21.0835471,\"lng\":105.7879705},\"distance\":17586},{\"start_loc\":{\"lat\":21.0835471,\"lng\":105.7879705},\"end_loc\":{\"lat\":21.1142089,\"lng\":105.7851023},\"distance\":3482},{\"start_loc\":{\"lat\":21.1142089,\"lng\":105.7851023},\"end_loc\":{\"lat\":21.1589799,\"lng\":105.7794464},\"distance\":5085},{\"start_loc\":{\"lat\":21.1589799,\"lng\":105.7794464},\"end_loc\":{\"lat\":21.1598179,\"lng\":105.7824035},\"distance\":333},{\"start_loc\":{\"lat\":21.1598179,\"lng\":105.7824035},\"end_loc\":{\"lat\":21.1602994,\"lng\":105.784163},\"distance\":199},{\"start_loc\":{\"lat\":21.1602994,\"lng\":105.784163},\"end_loc\":{\"lat\":21.1605495,\"lng\":105.783699},\"distance\":77},{\"start_loc\":{\"lat\":21.1605495,\"lng\":105.783699},\"end_loc\":{\"lat\":21.1573596,\"lng\":105.7624753},\"distance\":2295},{\"start_loc\":{\"lat\":21.1573596,\"lng\":105.7624753},\"end_loc\":{\"lat\":21.1619879,\"lng\":105.7605368},\"distance\":583},{\"start_loc\":{\"lat\":21.1619879,\"lng\":105.7605368},\"end_loc\":{\"lat\":21.1689836,\"lng\":105.7624787},\"distance\":804},{\"start_loc\":{\"lat\":21.1689836,\"lng\":105.7624787},\"end_loc\":{\"lat\":21.2402175,\"lng\":105.6808949},\"distance\":13156},{\"start_loc\":{\"lat\":21.2402175,\"lng\":105.6808949},\"end_loc\":{\"lat\":21.2848669,\"lng\":105.6331031},\"distance\":7172},{\"start_loc\":{\"lat\":21.2848669,\"lng\":105.6331031},\"end_loc\":{\"lat\":21.3035916,\"lng\":105.6245686},\"distance\":2438},{\"start_loc\":{\"lat\":21.3035916,\"lng\":105.6245686},\"end_loc\":{\"lat\":21.3073177,\"lng\":105.6166971},\"distance\":965},{\"start_loc\":{\"lat\":21.3073177,\"lng\":105.6166971},\"end_loc\":{\"lat\":21.3080505,\"lng\":105.6125763},\"distance\":456}]"
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

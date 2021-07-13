const express = require('express')
const Journeys = require('../models/journeys')
const auth = require('../middleware/auth')

const Journey_router = express.Router()

function convertData(data) {
    const arr = data.response.route[0].leg[0].maneuver
    let route = arr.map(vl => {
        return {
            distance: vl.length,
            "loc": {
                "type": "Point",
                "coordinates": [vl.position.longitude, vl.position.latitude]
            },
        }
    })
    return route
}


//register api
Journey_router.post('/journey/create', auth, async (req, res) => {
    // Create journey
    try {

        let newRoutes = convertData({
            "response": {
                "metaInfo": {
                    "timestamp": "2021-07-13T10:45:26Z",
                    "mapVersion": "8.30.122.152",
                    "moduleVersion": "7.2.202128-9109",
                    "interfaceVersion": "2.6.76",
                    "availableMapVersion": [
                        "8.30.122.152"
                    ]
                },
                "route": [
                    {
                        "waypoint": [
                            {
                                "linkId": "+1155531865",
                                "mappedPosition": {
                                    "latitude": 21.2475946,
                                    "longitude": 105.6674832
                                },
                                "originalPosition": {
                                    "latitude": 21.2476272,
                                    "longitude": 105.667428
                                },
                                "type": "stopOver",
                                "spot": 0.6976744,
                                "sideOfStreet": "left",
                                "mappedRoadName": "",
                                "label": "",
                                "shapeIndex": 0,
                                "source": "user"
                            },
                            {
                                "linkId": "-1156729765",
                                "mappedPosition": {
                                    "latitude": 21.1956962,
                                    "longitude": 105.5704482
                                },
                                "originalPosition": {
                                    "latitude": 21.1961168,
                                    "longitude": 105.5704323
                                },
                                "type": "stopOver",
                                "spot": 0.2720588,
                                "sideOfStreet": "right",
                                "mappedRoadName": "",
                                "label": "",
                                "shapeIndex": 199,
                                "source": "user"
                            }
                        ],
                        "mode": {
                            "type": "fastest",
                            "transportModes": [
                                "car"
                            ],
                            "trafficMode": "disabled",
                            "feature": []
                        },
                        "leg": [
                            {
                                "start": {
                                    "linkId": "+1155531865",
                                    "mappedPosition": {
                                        "latitude": 21.2475946,
                                        "longitude": 105.6674832
                                    },
                                    "originalPosition": {
                                        "latitude": 21.2476272,
                                        "longitude": 105.667428
                                    },
                                    "type": "stopOver",
                                    "spot": 0.6976744,
                                    "sideOfStreet": "left",
                                    "mappedRoadName": "",
                                    "label": "",
                                    "shapeIndex": 0,
                                    "source": "user"
                                },
                                "end": {
                                    "linkId": "-1156729765",
                                    "mappedPosition": {
                                        "latitude": 21.1956962,
                                        "longitude": 105.5704482
                                    },
                                    "originalPosition": {
                                        "latitude": 21.1961168,
                                        "longitude": 105.5704323
                                    },
                                    "type": "stopOver",
                                    "spot": 0.2720588,
                                    "sideOfStreet": "right",
                                    "mappedRoadName": "",
                                    "label": "",
                                    "shapeIndex": 199,
                                    "source": "user"
                                },
                                "length": 18681,
                                "travelTime": 1779,
                                "maneuver": [
                                    {
                                        "position": {
                                            "latitude": 21.2475946,
                                            "longitude": 105.6674832
                                        },
                                        "instruction": "Head <span class=\"heading\">northeast</span>. <span class=\"distance-description\">Go for <span class=\"length\">26 m</span>.</span>",
                                        "travelTime": 6,
                                        "length": 26,
                                        "id": "M1",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.2477946,
                                            "longitude": 105.6676197
                                        },
                                        "instruction": "Turn <span class=\"direction\">slightly right</span> toward <span class=\"sign\">AH14</span>. <span class=\"distance-description\">Go for <span class=\"length\">523 m</span>.</span>",
                                        "travelTime": 79,
                                        "length": 523,
                                        "id": "M2",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.2487173,
                                            "longitude": 105.6725657
                                        },
                                        "instruction": "Turn <span class=\"direction\">right</span> onto <span class=\"number\">AH14</span>. <span class=\"distance-description\">Go for <span class=\"length\">634 m</span>.</span>",
                                        "travelTime": 60,
                                        "length": 634,
                                        "id": "M3",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.2445438,
                                            "longitude": 105.676707
                                        },
                                        "instruction": "Make a U-Turn onto <span class=\"number\">AH14</span>. <span class=\"distance-description\">Go for <span class=\"length\">1.6 km</span>.</span>",
                                        "travelTime": 138,
                                        "length": 1611,
                                        "id": "M4",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.2555408,
                                            "longitude": 105.6670082
                                        },
                                        "instruction": "Take the <span class=\"exit\">2nd exit</span> from roundabout onto <span class=\"number\">AH14</span>. <span class=\"distance-description\">Go for <span class=\"length\">1.4 km</span>.</span>",
                                        "travelTime": 123,
                                        "length": 1431,
                                        "id": "M5",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.2614524,
                                            "longitude": 105.6550026
                                        },
                                        "instruction": "Turn <span class=\"direction\">slightly left</span> onto <span class=\"number\">ĐT.303</span>. <span class=\"distance-description\">Go for <span class=\"length\">116 m</span>.</span>",
                                        "travelTime": 54,
                                        "length": 116,
                                        "id": "M6",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.2612593,
                                            "longitude": 105.6539297
                                        },
                                        "instruction": "Turn <span class=\"direction\">left</span> onto <span class=\"number\">ĐT.303</span>. <span class=\"distance-description\">Go for <span class=\"length\">1.4 km</span>.</span>",
                                        "travelTime": 124,
                                        "length": 1419,
                                        "id": "M7",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.2588131,
                                            "longitude": 105.642482
                                        },
                                        "instruction": "Turn <span class=\"direction\">left</span> onto <span class=\"number\">ĐT.303</span>. <span class=\"distance-description\">Go for <span class=\"length\">5.5 km</span>.</span>",
                                        "travelTime": 439,
                                        "length": 5467,
                                        "id": "M8",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.2242019,
                                            "longitude": 105.6092227
                                        },
                                        "instruction": "Continue on <span class=\"number\">TL.303</span>. <span class=\"distance-description\">Go for <span class=\"length\">2.0 km</span>.</span>",
                                        "travelTime": 184,
                                        "length": 2033,
                                        "id": "M9",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.2067783,
                                            "longitude": 105.6135893
                                        },
                                        "instruction": "Turn <span class=\"direction\">right</span> onto <span class=\"next-street\">Đường Đê Tả Sông Hồng</span>. <span class=\"distance-description\">Go for <span class=\"length\">505 m</span>.</span>",
                                        "travelTime": 43,
                                        "length": 505,
                                        "id": "M10",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.2057912,
                                            "longitude": 105.608933
                                        },
                                        "instruction": "Continue toward <span class=\"sign\">Đường Đê Tả Sông Hồng</span>. <span class=\"distance-description\">Go for <span class=\"length\">72 m</span>.</span>",
                                        "travelTime": 11,
                                        "length": 72,
                                        "id": "M11",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.205641,
                                            "longitude": 105.6082571
                                        },
                                        "instruction": "Continue on <span class=\"next-street\">Đường Đê Tả Sông Hồng</span>. <span class=\"distance-description\">Go for <span class=\"length\">3.3 km</span>.</span>",
                                        "travelTime": 282,
                                        "length": 3341,
                                        "id": "M12",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.1955237,
                                            "longitude": 105.581156
                                        },
                                        "instruction": "Keep <span class=\"direction\">right</span>. <span class=\"distance-description\">Go for <span class=\"length\">68 m</span>.</span>",
                                        "travelTime": 13,
                                        "length": 68,
                                        "id": "M13",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.1953199,
                                            "longitude": 105.5805445
                                        },
                                        "instruction": "Turn <span class=\"direction\">right</span>. <span class=\"distance-description\">Go for <span class=\"length\">40 m</span>.</span>",
                                        "travelTime": 17,
                                        "length": 40,
                                        "id": "M14",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.1956418,
                                            "longitude": 105.5803621
                                        },
                                        "instruction": "Turn <span class=\"direction\">left</span>. <span class=\"distance-description\">Go for <span class=\"length\">393 m</span>.</span>",
                                        "travelTime": 62,
                                        "length": 393,
                                        "id": "M15",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.1936247,
                                            "longitude": 105.5773151
                                        },
                                        "instruction": "Turn <span class=\"direction\">right</span>. <span class=\"distance-description\">Go for <span class=\"length\">368 m</span>.</span>",
                                        "travelTime": 60,
                                        "length": 368,
                                        "id": "M16",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.1968327,
                                            "longitude": 105.5764246
                                        },
                                        "instruction": "Turn <span class=\"direction\">left</span>. <span class=\"distance-description\">Go for <span class=\"length\">634 m</span>.</span>",
                                        "travelTime": 84,
                                        "length": 634,
                                        "id": "M17",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.1956962,
                                            "longitude": 105.5704482
                                        },
                                        "instruction": "Arrive at your destination on the right.",
                                        "travelTime": 0,
                                        "length": 0,
                                        "id": "M18",
                                        "_type": "PrivateTransportManeuverType"
                                    }
                                ]
                            }
                        ],
                        "summary": {
                            "distance": 18681,
                            "trafficTime": 1798,
                            "baseTime": 1779,
                            "text": "The trip takes <span class=\"length\">18.7 km</span> and <span class=\"time\">30 mins</span>.",
                            "travelTime": 1779,
                            "_type": "RouteSummaryType"
                        }
                    }
                ],
                "language": "en-us"
            }
        })

        const body = {
            from: {
                "loc": {
                    "type": "Point",
                    "coordinates": [105.66764266646554, 21.248227186178333]
                },
                // lat: 20.96482878714222,
                // lng: 105.84217557982575,
                address: "Xã Đạo Đức",
                // province: 'HN'
            },
            to: {
                "loc": {
                    "type": "Point",
                    "coordinates": [105.56867468949658, 21.193815659518854]
                },
                // lat: 21.306707419857357,
                // lng: 105.61272817310709,
                address: "Huyện Yên Lạc",
                // province: 'VP'
            },
            distance: 44000,
            status: "STARTED",
            empty_seat: 40,
            time_start: 1623293947000,
            time_end: 1625885947000,
            price: [
            ],
            routes: newRoutes
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

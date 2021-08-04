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

        let newRoutes = convertData({
            "response": {
                "metaInfo": {
                    "timestamp": "2021-07-14T02:46:12Z",
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
                                "linkId": "-1162676738",
                                "mappedPosition": {
                                    "latitude": 21.0258631,
                                    "longitude": 105.7786121
                                },
                                "originalPosition": {
                                    "latitude": 21.0260498,
                                    "longitude": 105.7773815
                                },
                                "type": "stopOver",
                                "spot": 0.2317597,
                                "sideOfStreet": "neither",
                                "mappedRoadName": "Đường Phạm Hùng",
                                "label": "Đường Phạm Hùng",
                                "shapeIndex": 0,
                                "source": "user"
                            },
                            {
                                "linkId": "-1228600042",
                                "mappedPosition": {
                                    "latitude": 21.2933169,
                                    "longitude": 105.6307989
                                },
                                "originalPosition": {
                                    "latitude": 21.2930758,
                                    "longitude": 105.6297528
                                },
                                "type": "stopOver",
                                "spot": 0.8899083,
                                "sideOfStreet": "neither",
                                "mappedRoadName": "",
                                "label": "AH14",
                                "shapeIndex": 358,
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
                                    "linkId": "-1162676738",
                                    "mappedPosition": {
                                        "latitude": 21.0258631,
                                        "longitude": 105.7786121
                                    },
                                    "originalPosition": {
                                        "latitude": 21.0260498,
                                        "longitude": 105.7773815
                                    },
                                    "type": "stopOver",
                                    "spot": 0.2317597,
                                    "sideOfStreet": "neither",
                                    "mappedRoadName": "Đường Phạm Hùng",
                                    "label": "Đường Phạm Hùng",
                                    "shapeIndex": 0,
                                    "source": "user"
                                },
                                "end": {
                                    "linkId": "-1228600042",
                                    "mappedPosition": {
                                        "latitude": 21.2933169,
                                        "longitude": 105.6307989
                                    },
                                    "originalPosition": {
                                        "latitude": 21.2930758,
                                        "longitude": 105.6297528
                                    },
                                    "type": "stopOver",
                                    "spot": 0.8899083,
                                    "sideOfStreet": "neither",
                                    "mappedRoadName": "",
                                    "label": "AH14",
                                    "shapeIndex": 358,
                                    "source": "user"
                                },
                                "length": 49216,
                                "travelTime": 3281,
                                "maneuver": [
                                    {
                                        "position": {
                                            "latitude": 21.0258631,
                                            "longitude": 105.7786121
                                        },
                                        "instruction": "Head <span class=\"heading\">south</span> on <span class=\"street\">Đường Phạm Hùng</span>. <span class=\"distance-description\">Go for <span class=\"length\">54 m</span>.</span>",
                                        "travelTime": 17,
                                        "length": 54,
                                        "id": "M1",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.0253859,
                                            "longitude": 105.7785451
                                        },
                                        "instruction": "Make a U-Turn onto <span class=\"next-street\">Đường Phạm Hùng</span>. <span class=\"distance-description\">Go for <span class=\"length\">925 m</span>.</span>",
                                        "travelTime": 133,
                                        "length": 925,
                                        "id": "M2",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.0332823,
                                            "longitude": 105.7801223
                                        },
                                        "instruction": "Keep <span class=\"direction\">left</span> onto <span class=\"next-street\">Cầu Vượt Mai Dịch</span>. <span class=\"distance-description\">Go for <span class=\"length\">752 m</span>.</span>",
                                        "travelTime": 65,
                                        "length": 752,
                                        "id": "M3",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.0399985,
                                            "longitude": 105.7809699
                                        },
                                        "instruction": "Turn <span class=\"direction\">left</span> onto <span class=\"next-street\">Đường Vành Đai 3</span>. <span class=\"distance-description\">Go for <span class=\"length\">4.9 km</span>.</span>",
                                        "travelTime": 298,
                                        "length": 4915,
                                        "id": "M4",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.0831714,
                                            "longitude": 105.7880831
                                        },
                                        "instruction": "Continue on <span class=\"next-street\">Đường Phạm Văn Đồng</span>. <span class=\"distance-description\">Go for <span class=\"length\">3.4 km</span>.</span>",
                                        "travelTime": 250,
                                        "length": 3399,
                                        "id": "M5",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.1131477,
                                            "longitude": 105.7854116
                                        },
                                        "instruction": "Continue on <span class=\"next-street\">Đường Võ Văn Kiệt</span>. <span class=\"distance-description\">Go for <span class=\"length\">330 m</span>.</span>",
                                        "travelTime": 30,
                                        "length": 330,
                                        "id": "M6",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.1159694,
                                            "longitude": 105.7844353
                                        },
                                        "instruction": "Continue on <span class=\"next-street\">Cầu Việt Thắng</span>. <span class=\"distance-description\">Go for <span class=\"length\">66 m</span>.</span>",
                                        "travelTime": 5,
                                        "length": 66,
                                        "id": "M7",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.1165488,
                                            "longitude": 105.7842529
                                        },
                                        "instruction": "Continue on <span class=\"next-street\">Đường Võ Văn Kiệt</span>. <span class=\"distance-description\">Go for <span class=\"length\">2.5 km</span>.</span>",
                                        "travelTime": 153,
                                        "length": 2516,
                                        "id": "M8",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.1383712,
                                            "longitude": 105.7783949
                                        },
                                        "instruction": "Continue on <span class=\"next-street\">Cầu Kênh Giữa</span>. <span class=\"distance-description\">Go for <span class=\"length\">59 m</span>.</span>",
                                        "travelTime": 5,
                                        "length": 59,
                                        "id": "M9",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.1388969,
                                            "longitude": 105.7784164
                                        },
                                        "instruction": "Continue on <span class=\"next-street\">Đường Võ Văn Kiệt</span>. <span class=\"distance-description\">Go for <span class=\"length\">8.6 km</span>.</span>",
                                        "travelTime": 578,
                                        "length": 8627,
                                        "id": "M10",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.2164128,
                                            "longitude": 105.7784593
                                        },
                                        "instruction": "Turn <span class=\"direction\">left</span> onto <span class=\"next-street\">Quốc Lộ 2</span> <span class=\"number\">(AH14)</span> toward <span class=\"sign\"><span lang=\"vi-Latn\">Vinh Yen</span>/<span lang=\"vi-Latn\">Duong Cao Toc Noi Bai-Lao Ca</span></span>. <span class=\"distance-description\">Go for <span class=\"length\">566 m</span>.</span>",
                                        "travelTime": 65,
                                        "length": 566,
                                        "id": "M11",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.2191594,
                                            "longitude": 105.7738996
                                        },
                                        "instruction": "Turn <span class=\"direction\">right</span> onto <span class=\"next-street\">Đường Đi Vĩnh Yên Hà Nội</span> toward <span class=\"sign\"><span lang=\"vi-Latn\">Thai Nguyen</span></span>. <span class=\"distance-description\">Go for <span class=\"length\">225 m</span>.</span>",
                                        "travelTime": 28,
                                        "length": 225,
                                        "id": "M12",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.2211657,
                                            "longitude": 105.7739103
                                        },
                                        "instruction": "Keep <span class=\"direction\">left</span> toward <span class=\"sign\"><span lang=\"vi-Latn\">Lao Cai</span></span>. <span class=\"distance-description\">Go for <span class=\"length\">32 m</span>.</span>",
                                        "travelTime": 5,
                                        "length": 32,
                                        "id": "M13",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.2214553,
                                            "longitude": 105.773921
                                        },
                                        "instruction": "Take ramp onto <span class=\"number\">CT.05</span> <span class=\"next-street\">(Cao Tốc Nội Bài Lào Cai)</span>. <span class=\"distance-description\">Go for <span class=\"length\">13.7 km</span>.</span>",
                                        "travelTime": 634,
                                        "length": 13691,
                                        "id": "M14",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.2815475,
                                            "longitude": 105.6708169
                                        },
                                        "instruction": "Take the exit toward <span class=\"sign\"><span lang=\"vi-Latn\">KCN Binh Xuyen</span></span> onto <span class=\"next-street\">Đường Đi Khu Công Nghiệp Bình Xuyên</span>. <span class=\"distance-description\">Go for <span class=\"length\">537 m</span>.</span>",
                                        "travelTime": 39,
                                        "length": 537,
                                        "id": "M15",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.2829852,
                                            "longitude": 105.6680489
                                        },
                                        "instruction": "Continue on <span class=\"next-street\">Đường Đi Khu Công Nghiệp Bình Xuyên</span>. <span class=\"distance-description\">Go for <span class=\"length\">929 m</span>.</span>",
                                        "travelTime": 108,
                                        "length": 929,
                                        "id": "M16",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.2784898,
                                            "longitude": 105.6728554
                                        },
                                        "instruction": "Continue on <span class=\"next-street\">Đường Đi Bình Xuyên Bá Hiến Đại Lải</span> toward <span class=\"sign\"><span lang=\"vi-Latn\">Binh Xuyen</span></span>. <span class=\"distance-description\">Go for <span class=\"length\">63 m</span>.</span>",
                                        "travelTime": 9,
                                        "length": 63,
                                        "id": "M17",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.2782001,
                                            "longitude": 105.6733811
                                        },
                                        "instruction": "Continue on <span class=\"number\">ĐT.310B</span>. <span class=\"distance-description\">Go for <span class=\"length\">2.6 km</span>.</span>",
                                        "travelTime": 196,
                                        "length": 2619,
                                        "id": "M18",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.2557232,
                                            "longitude": 105.666858
                                        },
                                        "instruction": "Take the <span class=\"exit\">1st exit</span> from roundabout onto <span class=\"number\">AH14</span>. <span class=\"distance-description\">Go for <span class=\"length\">4.9 km</span>.</span>",
                                        "travelTime": 361,
                                        "length": 4894,
                                        "id": "M19",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.2847877,
                                            "longitude": 105.633148
                                        },
                                        "instruction": "Take the <span class=\"exit\">1st exit</span> from roundabout onto <span class=\"number\">AH14</span>. <span class=\"distance-description\">Go for <span class=\"length\">2.5 km</span>.</span>",
                                        "travelTime": 173,
                                        "length": 2461,
                                        "id": "M20",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.3036275,
                                            "longitude": 105.6244576
                                        },
                                        "instruction": "Take the <span class=\"exit\">5th exit</span> from roundabout onto <span class=\"number\">AH14</span>. <span class=\"distance-description\">Go for <span class=\"length\">1.6 km</span>.</span>",
                                        "travelTime": 129,
                                        "length": 1556,
                                        "id": "M21",
                                        "_type": "PrivateTransportManeuverType"
                                    },
                                    {
                                        "position": {
                                            "latitude": 21.2933169,
                                            "longitude": 105.6307989
                                        },
                                        "instruction": "Arrive at <span class=\"number\">AH14</span>.",
                                        "travelTime": 0,
                                        "length": 0,
                                        "id": "M22",
                                        "_type": "PrivateTransportManeuverType"
                                    }
                                ]
                            }
                        ],
                        "summary": {
                            "distance": 49216,
                            "trafficTime": 3365,
                            "baseTime": 3281,
                            "flags": [
                                "tollroad",
                                "motorway",
                                "builtUpArea"
                            ],
                            "text": "The trip takes <span class=\"length\">49.2 km</span> and <span class=\"time\">55 mins</span>.",
                            "travelTime": 3281,
                            "_type": "RouteSummaryType"
                        }
                    }
                ],
                "language": "en-us"
            }
        })

        const body = {
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
            to: {
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
            status: "STARTED",
            empty_seat: 40,
            time_start: 1623293947000,
            time_end: 1625885947000,
            price: [
            ],
            routes: {
                "type": "LineString",
                "coordinates": newRoutes
            },
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

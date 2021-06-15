const mongoose = require('mongoose')

var AutoIncrement = require('mongoose-sequence')(mongoose);

const journeys_Schema = mongoose.Schema({
    journey_id: {
        type: Number,
        required: false,
    },
    driver_id: {
        type: Number,
        required: false,
    },
    lst_cus_id: [{
        type: Number
    }],
    from: {
        lat: {
            type: Number,
            required: true,
        },
        lng: {
            type: Number,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        province: {
            type: String,
            required: true
        }
    },
    to: {
        lat: {
            type: Number,
            required: true,
        },
        lng: {
            type: Number,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        province: {
            type: String,
            required: true
        }
    },
    distance: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    empty_seat: {
        type: Number,
        required: true
    },
    time_start: {
        type: Number,
        required: true
    },
    time_end: {
        type: Number,
        required: true
    },
    price: [{
        from: {
            lat: {
                type: Number,
                required: true,
            },
            lng: {
                type: Number,
                required: true
            },
            address: {
                type: String,
                required: true
            }
        },
        to: {
            lat: {
                type: Number,
                required: true,
            },
            lng: {
                type: Number,
                required: true
            },
            address: {
                type: String,
                required: true
            }
        },
        price: {
            type: Number,
            required: true
        }
    }],
    routes: [{
        start_loc: {
            lat: {
                type: Number,
                required: true,
            },
            lng: {
                type: Number,
                required: true
            },
        },
        end_loc: {
            lat: {
                type: Number,
                required: true,
            },
            lng: {
                type: Number,
                required: true
            },
        },
        distance: {
            type: Number,
            required: true
        }
    }]

})

journeys_Schema.plugin(AutoIncrement, { id: 'journeys_seq', inc_field: 'journey_id' })


const Journeys = mongoose.model('journeys', journeys_Schema)

module.exports = Journeys
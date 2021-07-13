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
        loc: {
            type: { type: String },
            coordinates: []
        },
        address: {
            type: String,
            required: true
        },
    },
    to: {
        loc: {
            type: { type: String },
            coordinates: []
        },
        address: {
            type: String,
            required: true
        },
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
        loc: {
            type: { type: String },
            coordinates: []
        },
    }],
    routes: [{
        loc: {
            type: { type: String },
            coordinates: []
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
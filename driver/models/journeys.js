const mongoose = require('mongoose')
const Schema = mongoose.Schema;

var AutoIncrement = require('mongoose-sequence')(mongoose);
const CONSTANT_STATUS_JOUNEYS = {
    WAITING: 'WAITING',
    STARTED: 'STARTED',
    END: 'END',
    CANCEL:'CANCEL'
}
const journeys_Schema = mongoose.Schema({
    journey_id: {
        type: Number,
        required: false,
    },
    driver_id: {
        type: Schema.Types.ObjectId,
        ref: 'driver_schema'
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
        default: CONSTANT_STATUS_JOUNEYS.WAITING
    },

    time_start: {
        type: Number,
        required: true
    },
    time_end: {
        type: Number,
        required: true
    },
    allow_Shipping: {
        type: Boolean,
        required: true
    },
    price: [{
        distance: {
            type: Number,
            required: true
        },
        value: {
            type: Number,
            required: true
        }
    }],
    price_shipping: [{
        distance: {
            type: Number,
            required: true
        },
        value: {
            type: Number,
            required: true
        }
    }],

    routes: {
        type: { type: String },
        coordinates: []
    }

})

journeys_Schema.plugin(AutoIncrement, { id: 'journeys_seq', inc_field: 'journey_id' })
journeys_Schema.index({ "routes": "2dsphere" });

const Journeys = mongoose.model('journeys', journeys_Schema)

module.exports = Journeys
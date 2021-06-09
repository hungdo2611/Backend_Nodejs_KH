const mongoose = require('mongoose')

var AutoIncrement = require('mongoose-sequence')(mongoose);

const journeys_Schema = mongoose.Schema({
    journey_id: {
        type: Number,
        required: false,
    },
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
        
    }

})

journeys_Schema.plugin(AutoIncrement, { id: 'journeys_seq', inc_field: 'journey_id' })


const Journeys = mongoose.model('User', journeys_Schema)

module.exports = Journeys
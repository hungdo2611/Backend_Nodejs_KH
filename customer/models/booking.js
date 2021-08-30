const mongoose = require('mongoose')
var AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const booking_Schema = mongoose.Schema({
    _id: Schema.Types.ObjectId,
    booking_id: {
        type: Number,
        required: false,
    },
    journey_id: {
        type: Schema.Types.ObjectId,
        ref: 'journeys',
    },
    cus_id: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
    },
    driver_id: {
        type: Schema.Types.ObjectId,
        ref: 'driver_schema'
    },
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
    price: {
        type: Number,
        required: false,
    },
    seat: {
        type: Number,
        required: 2,
    },
    time_start: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: false
    }



})
booking_Schema.plugin(AutoIncrement, { id: 'booking_seq', inc_field: 'booking_id' })



booking_Schema.methods.generateAuthToken = async function () {

}

booking_Schema.statics.findByCredentials = async (phone) => {
    // Search for a user by email and password.
    const user = await Customer.findOne({ phone })
    if (!user) {
        return null;
    }

    return user
}

const Booking = mongoose.model('Booking', booking_Schema)

module.exports = Booking
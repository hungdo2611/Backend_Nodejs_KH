const mongoose = require('mongoose')
var AutoIncrement = require('mongoose-sequence')(mongoose);

const booking_Schema = mongoose.Schema({
    booking_id: {
        type: Number,
        required: false,
    },
    cus_id: {
        type: Number,
        required: true,
    },
    driver_id: {
        type: Number,
        required: true,
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
    price: {
        type: Number,
        required: true,
    },


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
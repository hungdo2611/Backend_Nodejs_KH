const mongoose = require('mongoose')
var AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

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
    booking_type: {
        type: String,
        require: true
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
    },
    time_start: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: false
    },
    suggestion_pick: {
        lat: {
            type: Number,
            required: false
        },
        lng: {
            type: Number,
            required: false
        },
        address: {
            type: String,
            required: false
        },
    },
    range_price: {
        max_price: {
            type: Number,
            required: false
        },
        min_price: {
            type: Number,
            required: false
        },
    },
    line_string: [{
        type: String,
    }],
    orderInfo: {
        phone_take_order: {
            type: String,
            required: false
        },
        note: {
            type: String,
            required: false
        },
        lst_image: [{
            type: String,
        }],
        weight: {
            type: String,
            required: false
        }
    },
    coupon_code: {
        type: String,
        required: false
    },
    rating_id: {
        type: Schema.Types.ObjectId,
        ref: 'rating_schema'
    }



})
booking_Schema.plugin(AutoIncrement, { id: 'booking_seq', inc_field: 'booking_id' })

booking_Schema.plugin(mongoosePaginate);


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
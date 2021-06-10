const mongoose = require('mongoose')
var AutoIncrement = require('mongoose-sequence')(mongoose);

const customer_Schema = mongoose.Schema({
    booking_id: {
        type: Number,
        required: false,
    },
    cus_id: {
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

})
customer_Schema.plugin(AutoIncrement, { id: 'booking_seq', inc_field: 'booking_id' })



customer_Schema.methods.generateAuthToken = async function () {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

customer_Schema.statics.findByCredentials = async (phone) => {
    // Search for a user by email and password.
    const user = await Customer.findOne({ phone })
    if (!user) {
        return null;
    }

    return user
}

const Customer = mongoose.model('User', customer_Schema)

module.exports = Customer
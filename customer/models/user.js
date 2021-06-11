const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validatePhone = require('../../utils/validatePhone')
var AutoIncrement = require('mongoose-sequence')(mongoose);

const customer_Schema = mongoose.Schema({
    cus_id: {
        type: Number,
        required: false,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: value => {
            if (!validatePhone(value)) {
                throw new Error({ error: 'Invalid phone number' })
            }
        }
    },
    is_active: {
        type: Boolean,
        required: false,
        default: false
    },
    join_date: {
        type: Number,
        required: true,
    },
    fb_id: {
        type: String,
        required: false,
        default: ""
    },
    gg_id: {
        type: String,
        required: false,
        default: ""
    },
    avatar: {
        type: String,
        required: false,
        default: ""
    },
    point: {
        type: Number,
        required: false,
        default: 0

    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})
customer_Schema.plugin(AutoIncrement, { id: 'customer_seq', inc_field: 'cus_id' })



customer_Schema.methods.generateAuthToken = async function () {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY_CUSTOMER)
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

const Customer = mongoose.model('Customer', customer_Schema)

module.exports = Customer
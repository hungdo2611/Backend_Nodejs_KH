const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { isValidPhoneNumber } = require('libphonenumber-js')
var AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const customer_Schema = mongoose.Schema({
    _id: Schema.Types.ObjectId,
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
            if (!isValidPhoneNumber(value, 'VN')) {
                throw new Error({ error: 'Invalid phone number' })
            }
        }
    },
    name: {
        type: String,
        required: false,
    },
    password: {
        type: String,
        required: false,
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
    }],
    device_token: {
        type: String,
        require: false
    }
})
customer_Schema.plugin(AutoIncrement, { id: 'customer_seq', inc_field: 'cus_id' })

// customer_Schema.pre('save', async function (next) {
//     // Hash the password before saving the user model
//     const user = this
//     if (user.isModified('password')) {
//         user.password = await bcrypt.hash(user.password, 8)
//     }
//     next()
// })

customer_Schema.methods.generateAuthToken = async function () {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY_CUSTOMER)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

customer_Schema.statics.findByCredentials = async (phone, password) => {
    // Search for a user by email and password.
    const user = await Customer.findOne({ phone })
    console.log("user", user)
    if (!user) {
        return null;
    }
    if (!user.password) {
        return "wrong password"
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
        return "wrong password"
    }
    return user
}

const Customer = mongoose.model('Customer', customer_Schema)

module.exports = Customer
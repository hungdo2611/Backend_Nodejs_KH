const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validatePhone = require('../../utils/validatePhone')
var AutoIncrement = require('mongoose-sequence')(mongoose);

const driver_Schema = mongoose.Schema({
    driver_id: {
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
    name: {
        type: String,
        required: true,
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
driver_Schema.plugin(AutoIncrement, { id: 'driver_seq', inc_field: 'driver_id' })

driver_Schema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

driver_Schema.methods.generateAuthToken = async function () {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY_DRIVER)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

driver_Schema.statics.findByCredentials = async (phone) => {
    // Search for a user by email and password.
    const user = await Driver.findOne({ phone })
    if (!user) {
        return null;
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    return user
}
const Driver = mongoose.model('driver_schema', driver_Schema)

module.exports = Driver
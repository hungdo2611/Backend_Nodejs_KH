const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { isValidPhoneNumber } = require('libphonenumber-js')
var AutoIncrement = require('mongoose-sequence')(mongoose);
const mongoosePaginate = require('mongoose-paginate-v2');

const Schema = mongoose.Schema;


const driver_Schema = mongoose.Schema({
    driver_id: {
        type: Number,
        required: false,
    },
    password: {
        type: String,
        required: false,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        index: true,
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
    ratingPoint: {
        value: {
            type: Number,
            required: false,
            default: 4.5
        },
        count: {
            type: Number,
            required: false,
            default: 1
        }
    },
    last_location: {
        type: { type: String },
        coordinates: []
    },
    last_update: Number,
    free_state: {
        type: Boolean,
        default: false
    },
    price_free: [{
        distance: {
            type: Number,
            required: false
        },
        value: {
            type: Number,
            required: false
        }
    }],
    license_plate: {
        type: String,
        required: false
    },
    vehicle_type: {
        type: String,
        required: false
    },
    verified_status: {
        type: Schema.Types.ObjectId,
        ref: 'license_schema'
    },
    device_token: {
        type: String,
        require: false
    }
})
driver_Schema.plugin(mongoosePaginate);

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
    const token = jwt.sign({ _id: user._id, is_active: user.is_active }, process.env.JWT_KEY_DRIVER)
    await user.save()
    return token
}

driver_Schema.statics.findByCredentials = async (phone, password) => {
    // Search for a user by email and password.
    const user = await Driver.findOne({ phone })
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

driver_Schema.index({ last_location: "2dsphere" });

const Driver = mongoose.model('driver_schema', driver_Schema)

module.exports = Driver
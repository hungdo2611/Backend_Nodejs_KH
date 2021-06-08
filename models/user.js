const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validatePhone = require('../utils/validatePhone')
var AutoIncrement = require('mongoose-sequence')(mongoose);

const userSchema = mongoose.Schema({
    user_id: {
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
    password: {
        type: String,
        required: true,
        minLength: 7
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})
userSchema.plugin(AutoIncrement, { id: 'user_seq', inc_field: 'user_id' })

userSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.methods.generateAuthToken = async function () {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (phone, password) => {
    // Search for a user by email and password.
    const user = await User.findOne({ phone })
    if (!user) {
        return null;
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
        return 'WRONG PASS'
    }
    return user
}

const User = mongoose.model('User', userSchema)

module.exports = User
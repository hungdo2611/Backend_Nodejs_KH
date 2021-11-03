const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Schema = mongoose.Schema;

const admin_schema = mongoose.Schema({
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
    token: {
        type: String,
        require: true
    }
})



admin_schema.methods.generateAuthToken = async function () {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY_ADMIN)
    user.token = token
    await user.save()
    return token
}

admin_schema.statics.findByCredentials = async (name, password) => {
    // Search for a user by email and password.
    const user = await Admin.findOne({ name })
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

const Admin = mongoose.model('Admin', admin_schema)

module.exports = Admin
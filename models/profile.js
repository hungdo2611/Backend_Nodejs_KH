const mongoose = require('mongoose')

const profileSchema = mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        trim: true
    },
    is_Active: {
        type: Boolean,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    balance: {
        type: Number,
        required: true,
    },
    avatar: {
        type: Number,
        require: true
    },
    

})



const Profile = mongoose.model('Profile', profileSchema)

module.exports = Profile
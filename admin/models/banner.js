const mongoose = require('mongoose')



const list_banner = mongoose.Schema({
    time: {
        type: Number,
        required: true,
    },
    linkImage:{
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
    }
})



const Banner = mongoose.model('list_banner', list_banner)

module.exports = Banner
const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');


const notification_customer = mongoose.Schema({
    time: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    data: {
        type: Object,
        require: false
    }
})


notification_customer.plugin(mongoosePaginate);

const Notification_Customer = mongoose.model('notification_customer', notification_customer)

module.exports = Notification_Customer
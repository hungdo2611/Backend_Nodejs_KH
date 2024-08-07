const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');


const notification_schema = mongoose.Schema({
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


notification_schema.plugin(mongoosePaginate);

const Notification = mongoose.model('notification_schema', notification_schema)

module.exports = Notification
const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');


const notification_schema = mongoose.Schema({
    _id: Schema.Types.ObjectId,
    driver_id: {
        type: Schema.Types.ObjectId,
        require: true
    },
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
    },
    type: {
        type: String,
        require: true
    }
})


notification_schema.plugin(mongoosePaginate);

const Notification = mongoose.model('notification_schema', notification_schema)

module.exports = Notification
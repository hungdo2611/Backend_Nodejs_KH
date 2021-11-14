const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');


const charge_Schema = mongoose.Schema({
    driver_id: {
        type: Schema.Types.ObjectId,
        ref: 'driver_schema',
        require: true
    },
    amount: {
        type: Number,
    },
    payment_method: {
        type: String,
    },
    image: {
        type: String,
    },
    time: {
        type: Number,
    },
    status: {
        type: String
    },
    content: {
        type: Number
    }

})


charge_Schema.plugin(mongoosePaginate);

const Transaction = mongoose.model('charge_Schema', charge_Schema)

module.exports = Transaction
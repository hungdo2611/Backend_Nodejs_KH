const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');


const transaction_Schema = mongoose.Schema({
    driver_id: {
        type: Schema.Types.ObjectId,
        require: true
    },
    time: {
        type: Number,
    },
    type: {
        type: String,
    },
    content: {
        type: String,
    },
    amount: {
        type: Number,
    }

})


transaction_Schema.plugin(mongoosePaginate);

const Transaction = mongoose.model('transaction_Schema', transaction_Schema)

module.exports = Transaction
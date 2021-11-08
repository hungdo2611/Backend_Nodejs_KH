const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');


const rating_schema = mongoose.Schema({
    driver_id: {
        type: Schema.Types.ObjectId,
        require: true
    },
    booking_id: {
        type: Schema.Types.ObjectId,
        require: true
    },
    rate_value: {
        type: Number,
        require: true
    },
    comment: {
        type: String,
        require: true
    }

})


rating_schema.plugin(mongoosePaginate);

const Rating = mongoose.model('rating_schema', rating_schema)

module.exports = Rating
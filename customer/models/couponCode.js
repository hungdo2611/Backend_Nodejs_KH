const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');


const coupon_code_Schema = mongoose.Schema({
    //second
    expired_time: {
        type: Number,
        require: true
    },
    code: {
        type: String,
        require: true,
        unique: true,
        index: true
    },
    content: {
        type: String,
        require: true
    },

    // by cash
    amount: {
        type: Number,
        require: true
    },
    // giảm giá tối đa
    max_apply: {
        type: Number,
        require: true
    },
    condition: {
        min_Price: {
            type: Number
        },

    }

})


coupon_code_Schema.plugin(mongoosePaginate);

const Coupon_Code = mongoose.model('coupon_code_Schema', coupon_code_Schema)

module.exports = Coupon_Code
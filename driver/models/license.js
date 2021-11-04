const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2');

const Schema = mongoose.Schema;
const vehicleTypeData = {
    MOTO: 1,
    HATCH_BACK: 4,
    SEDAN: 5,
    '7_SEAT': 7,
    '9_SEAT': 9,
    '16_SEAT': 16,
    '29_45_SEAT': 60,
    PICK_UP_TRUCK: 70,
    TRUCK: 71,


}

// const vehicleTypeData = [
//     { name: "xe mô tô", id: 1 },
//     { name: "4 chỗ nhỏ (hatchback)", id: 4 },
//     { name: "4 chỗ cốp rộng (sedan)", id: 5 },
//     { name: "7 chỗ phổ thông", id: 7 },
//     { name: "9 chỗ Dcar", id: 9 },
//     { name: "16 chỗ", id: 16 },
//     { name: "29-45 chỗ", id: 60 },
//     { name: "xe bán tải", id: 70 },
//     { name: "xe tải", id: 71 }
// ];

const license_schema = mongoose.Schema({
    driver_id: {
        type: Schema.Types.ObjectId,
        require: true
    },
    display_name: {
        type: String,
        required: true,
    },
    vehicle_type: {
        type: Number,
        required: true,
    },
    license_plate: {
        type: String,
        required: true,
    },
    business: {
        type: String,
        require: false
    },
    status: {
        type: String
    },
    reject: {
        type: String
    },
    lst_image_passport: [
        {
            type: String,
        }
    ],
    lst_image_license: [
        {
            type: String,
        }
    ]

})

license_schema.plugin(mongoosePaginate);


const License = mongoose.model('license_schema', license_schema)

module.exports = License
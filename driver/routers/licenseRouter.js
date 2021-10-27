const express = require('express')
const License = require('../models/license')
const Driver = require('../models/driver')
const { auth } = require('../middleware/auth')
const { pushNotificationTo_User } = require('../../utils/index')
const license_router = express.Router()
const status = {
    VERIFYING: 'VERIFYING',
    VERIFIED: 'VERIFIED',
    FAILED: 'FAILED'
}
license_router.post('/license/update', auth, async (req, res) => {
    try {
        const { driver_id, display_name, vehicle_type, license_plate, business, lst_image_passport, lst_image_license } = req.body;
        const license = new License({ driver_id, display_name, vehicle_type, license_plate, business, lst_image_passport, lst_image_license, status: status.VERIFYING })
        await license.save();
        req.user.verified_status = license._id;
        await req.user.save();
        res.status(200).send({ err: false, data: 'success' })
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})

/// phê duyệt license, require admin auth

license_router.post('/license/approve', async (req, res) => {
    try {
        const { license_id } = req.body;
        const upddate = await License.findOneAndUpdate({ _id: license_id }, { status: status.VERIFIED })
        const driver = await Driver.findOne({ _id: upddate.driver_id })
        pushNotificationTo_User(
            [driver.device_token],
            'Tài khoản đã xác thực',
            'Tài khoản của bạn đã được xác thực thành công',
            {})
        res.status(200).send({ err: false, data: 'success' })
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})
license_router.post('/license/decline', async (req, res) => {
    try {
        const { license_id } = req.body;
        const upddate = await License.findOneAndUpdate({ _id: license_id }, { status: status.FAILED })
        const driver = await Driver.findOne({ _id: upddate.driver_id })
        pushNotificationTo_User(
            [driver.device_token],
            'Xác thực tài khoản thất bại',
            'Vui lòng gửi xác thực lại hoặc yêu cầu hỗ trợ',
            {})
        res.status(200).send({ err: false, data: 'success' })
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})


module.exports = license_router;
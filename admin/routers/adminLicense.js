const express = require('express')
const Admin = require('../models/user')
const { auth, authWithoutData } = require('../middleware/auth')
const License = require('../../driver/models/license')
const Driver = require('../../driver/models/driver')

const adminLicense = express.Router()
const { pushNotificationTo_User } = require('../../utils/index')
const { CONSTANT_NOTIFICATION } = require('../../constant')

const status = {
    VERIFYING: 'VERIFYING',
    VERIFIED: 'VERIFIED',
    FAILED: 'FAILED'
}

adminLicense.get('/admin/license', authWithoutData, async (req, res) => {
    try {
        const { page_number, page_size } = req.query;
        if (!page_number || !page_size) {
            res.status(400).send({ err: true, data: 'missing param' })
        }
        const lst_License = await License.paginate(
            { status: status.VERIFYING },
            {
                page: page_number,
                limit: page_size,
                forceCountFn: true,
            });
        res.status(200).send({ data: lst_License.docs, err: false, total: lst_License.totalDocs })

    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})
/// phê duyệt license, require admin auth

adminLicense.post('/admin/license/approve', authWithoutData, async (req, res) => {
    try {
        const { license_id } = req.body;
        let data_license = await License.findOne({ _id: license_id })
        if (data_license.status === status.VERIFYING) {
            data_license.status = status.VERIFIED;
            await data_license.save();
            const driver = await Driver.findOneAndUpdate({ _id: data_license.driver_id }, { license_plate: data_license.license_plate }, { new: true });
            pushNotificationTo_User(
                [driver.device_token],
                'Tài khoản đã xác thực',
                'Tài khoản của bạn đã được xác thực thành công',
                {
                    type: CONSTANT_NOTIFICATION.DRIVER_VEIRY_STATUS
                })
            res.status(200).send({ err: false, data: 'success' })
        } else {
            res.status(200).send({ err: true, data: 'Tài khoản này ko ở trạng thái cần xác thực' })
        }

    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})
adminLicense.post('/admin/license/decline', authWithoutData, async (req, res) => {
    try {
        const { license_id, reason } = req.body;
        let data_license = await License.findOne({ _id: license_id })
        if (data_license.status == status.VERIFYING) {
            data_license.status = status.FAILED;
            data_license.reject = reason;
            await data_license.save();
            const driver = await Driver.findOne({ _id: data_license.driver_id })
            pushNotificationTo_User(
                [driver.device_token],
                'Xác thực tài khoản thất bại',
                'Vui lòng gửi xác thực lại hoặc yêu cầu hỗ trợ',
                {
                    type: CONSTANT_NOTIFICATION.DRIVER_VEIRY_STATUS
                })
            res.status(200).send({ err: false, data: 'success' })
        } else {
            res.status(200).send({ err: true, data: 'Tài khoản này ko ở trạng thái cần xác thực' })
        }

    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})

module.exports = adminLicense;
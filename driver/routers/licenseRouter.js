const express = require('express')
const License = require('../models/license')
const Driver = require('../models/driver')
const { auth } = require('../middleware/auth')
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



module.exports = license_router;
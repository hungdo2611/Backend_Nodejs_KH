const express = require('express')
const Coupon_Code = require('../models/couponCode')
const auth = require('../middleware/auth')
const auth_driver = require('../../driver/middleware/auth')
const coupon_code_router = express.Router()


// driver lấy chi tiết coupon
coupon_code_router.get('/coupon/detail', auth_driver.auth, async (req, res) => {
    try {

        const { code } = req.query;

        const coupon = await Coupon_Code.findOne({ code: code })
        console.log("coupon", coupon)
        if (coupon) {
            res.status(200).send({ err: false, data: coupon })
        } else {
            res.status(200).send({ err: true, data: 'not found' })
        }
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})

// driver lấy chi tiết coupon
coupon_code_router.get('/coupon/customer/detail', auth, async (req, res) => {
    try {

        const { code } = req.query;

        const coupon = await Coupon_Code.findOne({ code: code })
        console.log("coupon", coupon)
        if (coupon) {
            res.status(200).send({ err: false, data: coupon })
        } else {
            res.status(200).send({ err: true, data: 'not found' })
        }
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})


// khách hàng lấy ds coupon
coupon_code_router.get('/coupon', auth, async (req, res) => {
    try {

        const lst_coupon_used = req.user.coupon_used ? req.user.coupon_used : []
        const current_time = (Date.now() / 1000) >> 0;

        const coupon = await Coupon_Code.find(
            { expired_time: { $gt: current_time }, code: { $nin: lst_coupon_used } }
        ).sort({ $natural: -1 });

        res.status(200).send({ err: false, data: coupon })
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})

// Thêm coupon
// admin auth
coupon_code_router.post('/coupon', async (req, res) => {
    try {

        const { expired_time, code, content, amount, max_apply, condition } = req.body;
        const checkExist = await Coupon_Code.findOne({ code: code })
        if (checkExist) {
            return res.status(200).send({ err: true, data: 'Code is existed' })
        }
        const new_Coupon = new Coupon_Code({ expired_time, code, content, amount, max_apply, condition })
        await new_Coupon.save();
        res.status(200).send({ err: false, data: new_Coupon })
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})

module.exports = coupon_code_router;
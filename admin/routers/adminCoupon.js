const express = require('express')
const auth = require('../middleware/auth')

const Coupon = require('../../customer/models/couponCode')

const adminCoupon = express.Router()

adminCoupon.get('/admin/coupon', auth, async (req, res) => {
    try {
        const { page_number, page_size } = req.query;
        if (!page_number || !page_size) {
            res.status(400).send({ err: true, data: 'missing param' })
        }
        const lst_coupon = await Coupon.paginate(
            {},
            {
                page: page_number,
                limit: page_size,
                forceCountFn: true,
                sort: { $natural: -1 },
            });
        res.status(200).send({ data: lst_coupon.docs, err: false, total: lst_coupon.totalDocs })


    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }

})
// Thêm coupon
// admin auth
adminCoupon.post('/coupon/add', auth, async (req, res) => {
    try {

        const { expired_time, code, content, amount, max_apply, condition } = req.body;
        const checkExist = await Coupon.findOne({ code: code })
        if (checkExist) {
            return res.status(200).send({ err: true, data: 'Code is existed' })
        }
        const new_Coupon = new Coupon({ expired_time, code, content, amount, max_apply, condition })
        await new_Coupon.save();
        res.status(200).send({ err: false, data: new_Coupon })
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})
adminCoupon.post('/coupon/update', auth, async (req, res) => {
    try {

        const { expired_time, code, content, amount, max_apply, condition } = req.body;
        const dataUpdate = await Coupon.findOneAndUpdate(
            { code: code },
            { expired_time, content, amount, max_apply, condition }, {
            new: true
        })
        res.status(200).send({ err: false, data: dataUpdate })
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})


module.exports = adminCoupon;
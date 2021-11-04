const jwt = require('jsonwebtoken')
const Driver = require('../models/driver')

const auth = async (req, res, next) => {

    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, process.env.JWT_KEY_DRIVER)

        const user = await Driver.findOne({ _id: data._id }, { tokens: 0, password: 0, }).populate("verified_status", "status reject")
        console.log("user", user)
        if (!user) {
            throw new Error()
        }
        if (!user.is_active) {
            res.status(444).send({ error: 'Tài khoản đã bị khoá. Vui lòng liên hệ với admin để được nhận hỗ trợ' })
        }
        req.user = user
        req.token = token
        next()
    } catch (error) {
        res.status(401).send({ error: 'Not authorized to access this resource' })
    }

}
const authTransaction = async (req, res, next) => {

    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, process.env.JWT_KEY_DRIVER)

        const user = await Driver.findOne({ _id: data._id }, { tokens: 0, password: 0, }).populate("verified_status", "status")
        if (!user) {
            throw new Error()
        }
        if (!user.is_active) {
            res.status(444).send({ error: 'Tài khoản đã bị khoá. Vui lòng liên hệ với admin để được nhận hỗ trợ' })
        }
        req.user = user
        req.token = token
        next()
    } catch (error) {
        res.status(401).send({ error: 'Not authorized to access this resource' })
    }

}
module.exports = { auth, authTransaction }
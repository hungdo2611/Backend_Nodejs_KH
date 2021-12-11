const jwt = require('jsonwebtoken')
const Customer = require('../models/user')

const auth = async (req, res, next) => {

    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, process.env.JWT_KEY_CUSTOMER)
        const user = await Customer.findOne({ _id: data._id }, { password: 0, })

        if (!user) {
            throw new Error()
        }
        req.user = user
        req.token = token
        next()
    } catch (error) {
        console.log("error", error)
        res.status(401).send({ error: 'Not authorized to access this resource' })
    }

}
const authWithoutData = async (req, res, next) => {

    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, process.env.JWT_KEY_CUSTOMER)
        req._id = data._id;
        if (!data.is_active) {
            res.status(444).send({ error: 'Tài khoản đã bị khoá. Vui lòng liên hệ với admin để được nhận hỗ trợ' })
            return
        }
        next()
    } catch (error) {
        res.status(401).send({ error: 'Not authorized to access this resource' })
    }

}
module.exports = { auth, authWithoutData }
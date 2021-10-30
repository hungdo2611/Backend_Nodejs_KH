const jwt = require('jsonwebtoken')
const Customer = require('../models/User')

const auth = async (req, res, next) => {

    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, process.env.JWT_KEY_CUSTOMER)
        const user = await Customer.findOne({ _id: data._id }, { tokens: 0, password: 0, })
        console.log("user", user)

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
module.exports = auth
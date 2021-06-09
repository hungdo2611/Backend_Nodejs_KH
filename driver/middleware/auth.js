const jwt = require('jsonwebtoken')
const Driver = require('../models/user')

const auth = async (req, res, next) => {

    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        console.log("token", token)
        const data = jwt.verify(token, process.env.JWT_KEY_DRIVER)

        const user = await Driver.findOne({ _id: data._id })
        if (!user) {
            throw new Error()
        }
        req.user = user
        req.token = token
        next()
    } catch (error) {
        res.status(401).send({ error: 'Not authorized to access this resource' })
    }

}
module.exports = auth
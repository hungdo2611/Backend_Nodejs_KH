const jwt = require('jsonwebtoken')
const Admin = require('../models/user')

const auth = async (req, res, next) => {

    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, process.env.JWT_KEY_ADMIN)
        const user = await Admin.findOne({ _id: data._id })

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
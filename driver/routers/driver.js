const express = require('express')
const Driver = require('../models/driver')
const auth = require('../middleware/auth')
const mongoose = require('mongoose');

const driver_router = express.Router()


const formatUser = (user) => {
    return {
        "is_active": user.is_active,
        "fb_id": user.fb_id,
        "gg_id": user.gg_id,
        "avatar": user.avatar,
        "point": user.point,
        "phone": user.phone,
        "join_date": user.join_date,
        "name": user.name,

        "driver_id": user.driver_id,

    }
}


/**
 * @swagger
 * /users:
 *   post:
 *     description: register user
 *     responses:
 *       '200':
 *          description: A successful respone

 */


//register api
driver_router.post('/driver/register', async (req, res) => {
    // Create a new user
    try {
        const body = {
            phone: req.body.phone,
            join_date: Date.now(),
            _id: new mongoose.Types.ObjectId(),
        }
        const user = new Driver(body)
        console.log("user", req.body)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})
//login api
driver_router.post('/driver/login', async (req, res) => {
    //Login a registered user
    try {
        const { phone } = req.body

        const user = await Driver.findByCredentials(phone)
        if (!user) {
            return res.status(401).send({ err: true, data: "user not found" })
        }
        const token = await user.generateAuthToken()
        const responeDt = formatUser(user);

        res.status(200).send({ data: { ...responeDt, token }, token, err: false })
    } catch (error) {
        res.status(400).send(error)
    }
})
//logout api
driver_router.post('/driver/me/logout', auth, async (req, res) => {
    // Log user out of the application
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send({ err: false, data: "success" })
    } catch (error) {
        res.status(500).send(error)
    }
})
//logout all
driver_router.post('/driver/me/logoutall', auth, async (req, res) => {
    // Log user out of all devices
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send({ err: false, data: "success" })
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = driver_router;
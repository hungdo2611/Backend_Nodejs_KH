const express = require('express')
const Customer = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()





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
router.post('/users/register', async (req, res) => {
    // Create a new user
    try {
        const body = {
            phone: req.body.phone,
            join_date: Date.now(),

        }
        const user = new Customer(body)
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
router.post('/users/login', async (req, res) => {
    //Login a registered user
    try {
        const { phone } = req.body

        const user = await Customer.findByCredentials(phone)
        if (!user) {
            return res.status(401).send({ err: true, data: "user not found" })
        }
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})
//logout api
router.post('/users/me/logout', auth, async (req, res) => {
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
router.post('/users/me/logoutall', auth, async (req, res) => {
    // Log user out of all devices
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send({ err: false, data: "success" })
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router;
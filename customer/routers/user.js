const express = require('express')
const Customer = require('../models/User')
const auth = require('../middleware/auth')
const customer_router = express.Router()
const parsePhoneNumber = require('libphonenumber-js')
const { isValidPhoneNumber } = require('libphonenumber-js')
var admin = require("firebase-admin");


/**
 * @swagger
 * /users:
 *   post:
 *     description: register user
 *     responses:
 *       '200':
 *          description: A successful respone

 */
//check phone exist api
customer_router.get('/users/exist/:phone', async (req, res) => {
    // Create a new user
    try {
        let phone = req.params.phone;
        let isvalidate = isValidPhoneNumber(phone, 'VN')
        if (!isvalidate) {
            res.status(200).send({ data: null, err: 'Wrong format' })
            return
        }
        const phoneNumber = parsePhoneNumber(phone, 'VN')
        let data = await Customer.findOne({ phone: phoneNumber.number })
        if (data) {
            res.status(200).send({ data: true, err: false })

        } else {
            res.status(200).send({ data: false, err: false })

        }

    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})

//register api
customer_router.post('/users/register', async (req, res) => {
    // Create a new user
    try {
        const tokenFirebase = req.body.token;
        let verify = await admin.auth().verifyIdToken(tokenFirebase);

        let isvalidate = isValidPhoneNumber(req.body.phone, 'VN');

        if (!req.body.phone) {
            res.status(200).send({ data: null, err: 'Missing Phone number' });
            return
        }

        if (!isvalidate) {
            res.status(200).send({ data: null, err: 'Phone number invalid' });
            return
        }
        const phoneNumber = parsePhoneNumber(req.body.phone, 'VN')
        const bodyrequest = {
            phone: phoneNumber.number,
            join_date: Date.now(),
            is_active: true,
            name: '',

        }
        const user = new Customer(bodyrequest)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ data: user, token, err: false })
    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})
//login api
customer_router.post('/users/login', async (req, res) => {
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
customer_router.post('/users/me/logout', auth, async (req, res) => {
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
customer_router.post('/users/me/logoutall', auth, async (req, res) => {
    // Log user out of all devices
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send({ err: false, data: "success" })
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = customer_router;
const express = require('express')
const Driver = require('../models/driver')
const auth = require('../middleware/auth')
const mongoose = require('mongoose');

const driver_router = express.Router()
const parsePhoneNumber = require('libphonenumber-js')
const { isValidPhoneNumber } = require('libphonenumber-js')
const bcrypt = require('bcryptjs')

var admin = require("firebase-admin");

const CONSTANT_DATA = require('../../constant')
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

async function addCoinToDriver(_id, amount) {
    let driver = await Driver.findOneAndUpdate({ _id: _id, }, { $inc: { 'point': amount } }, {
        new: true
    });
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

//get service charge 
driver_router.get('/driver/service/charge', auth, async (req, res) => {
    try {
        res.status(200).send({ data: CONSTANT_DATA.SERVICE_CHARGE, err: false, user_info: req.user, token: req.token })


    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})

//check phone exist api
driver_router.get('/driver/exist/:phone', async (req, res) => {
    // Create a new user
    try {
        console.log('check')
        let phone = req.params.phone;
        let isvalidate = isValidPhoneNumber(phone, 'VN')
        if (!isvalidate) {
            res.status(200).send({ data: null, err: 'Wrong format' })
            return
        }
        const phoneNumber = parsePhoneNumber(phone, 'VN')
        let data = await Driver.findOne({ phone: phoneNumber.number })
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
//register device token
driver_router.post('/driver/register/devicetoken', auth, async (req, res) => {
    // Create a new user
    try {
        const { device_token } = req.body;
        req.user.device_token = device_token;
        await req.user.save()

        res.status(200).send({ data: true, err: false })
    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})


//register api
driver_router.post('/driver/register', async (req, res) => {
    // Create a new user
    try {
        const tokenFirebase = req.body.token;
        let verify = await admin.auth().verifyIdToken(tokenFirebase);

        let isvalidate = isValidPhoneNumber(req.body.phone, 'VN');

        if (!req.body.phone) {
            res.status(404).send({ data: null, err: 'Missing Phone number' });
            return
        }

        if (!isvalidate) {
            res.status(404).send({ data: null, err: 'Phone number invalid' });
            return
        }
        const phoneNumber = parsePhoneNumber(req.body.phone, 'VN')
        const bodyrequest = {
            _id: new mongoose.Types.ObjectId(),
            phone: phoneNumber.number,
            join_date: Date.now(),
            is_active: true,
            name: '',

        }
        const user = new Driver(bodyrequest)

        await user.save()
        const responeDt = formatUser(user);

        const token = await user.generateAuthToken()
        res.status(200).send({ data: { ...responeDt, token }, token, err: false })
    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})

//login api
driver_router.post('/driver/login', async (req, res) => {
    try {
        const { phone, password } = req.body
        const phoneNumber = parsePhoneNumber(phone, 'VN')

        const user = await Driver.findByCredentials(phoneNumber.number, password)
        if (user == "wrong password") {
            return res.status(200).send({ err: true, data: "Wrong pass" })
        }
        if (!user) {
            return res.status(200).send({ err: true, data: "user not found" })
        }
        const token = await user.generateAuthToken()
        const responeDt = formatUser(user);
        res.status(200).send({ data: { ...responeDt, token }, token, err: false })
    } catch (error) {
        res.status(400).send(error);
        console.log('err login', error)
    }
})
//logout api
driver_router.post('/driver/me/logout', auth, async (req, res) => {
    // Log user out of the application
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        req.user.device_token = ''
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
//update profile api
driver_router.post('/driver/profile', auth, async (req, res) => {
    // Create a new user
    try {
        // const body = {
        //     password: '',
        //     name: ''
        // }
        console.log("req data", req.user)
        if (req.body.password.length < 6) {
            res.status(404).send({ data: null, err: "Password min length is 6" })
            return
        }
        const pass = await bcrypt.hash(req.body.password, 8)
        req.user.name = req.body.name;
        req.user.password = pass;

        await req.user.save();
        const responeDt = formatUser(req.user);


        res.status(200).send({ data: responeDt, err: false })
    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})
//reset password
driver_router.post('/driver/reset/password', async (req, res) => {
    try {
        // const bodysample = {
        //     token: token,
        //     phone: phone,
        //     password: password
        // }
        const tokenFirebase = req.body.token;
        let verify = await admin.auth().verifyIdToken(tokenFirebase);


        if (!req.body.phone) {
            res.status(404).send({ data: null, err: 'Missing Phone number' });
            return
        }

        const phoneNumber = parsePhoneNumber(req.body.phone, 'VN')
        const passhash = await bcrypt.hash(req.body.password, 8)
        let user = await Driver.findOneAndUpdate({ phone: phoneNumber.number, }, {
            password: passhash
        }, {
            new: true
        });


        const token = await user.generateAuthToken()
        const responeDt = formatUser(data);

        res.status(200).send({ data: { ...responeDt, token }, token, err: false })
    } catch (error) {
        console.log("error", error)
        res.status(400).send(error)
    }
})

module.exports = { driver_router };
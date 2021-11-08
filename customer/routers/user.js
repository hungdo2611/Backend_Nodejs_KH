const express = require('express')
const Customer = require('../models/User')
const auth = require('../middleware/auth')
const customer_router = express.Router()
const parsePhoneNumber = require('libphonenumber-js')
const { isValidPhoneNumber } = require('libphonenumber-js')
var admin = require("firebase-admin");
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const License = require('../../driver/models/license')



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
        "cus_id": user.cus_id,


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
        res.status(400).send({ err: true, error })

    }
})
customer_router.post('/users/register/devicetoken', auth, async (req, res) => {
    // Create a new user
    try {
        const { device_token } = req.body;
        req.user.device_token = device_token;
        await req.user.save()

        res.status(200).send({ data: true, err: false })
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

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
            res.status(404).send({ data: null, err: 'Missing Phone number' });
            return
        }

        if (!isvalidate) {
            res.status(404).send({ data: null, err: 'Phone number invalid' });
            return
        }
        const phoneNumber = parsePhoneNumber(req.body.phone, 'VN')
        const bodyrequest = {
            "_id": new mongoose.Types.ObjectId(),
            phone: phoneNumber.number,
            join_date: Date.now(),
            is_active: true,
            name: '',

        }
        const user = new Customer(bodyrequest)
        await user.save()
        const token = await user.generateAuthToken()
        const responeDt = formatUser(user);

        res.status(200).send({ data: { ...responeDt, token }, token, err: false })
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})
//update password
customer_router.post('/users/profile', auth, async (req, res) => {
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

        res.status(200).send({ data: { ...responeDt, token: req.token }, err: false })
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})
customer_router.post('/users/info', auth, async (req, res) => {
    // Create a new user
    try {
        // const body = {
        //     password: '',
        //     name: ''
        // }

        req.user.name = req.body.name;
        req.user.avatar = req.body.avatar;

        await req.user.save();
        const responeDt = formatUser(req.user);

        res.status(200).send({ data: { ...responeDt, token: req.token }, err: false })
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})
//reset password
customer_router.post('/users/reset/password', async (req, res) => {
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
        let user = await Customer.findOneAndUpdate({ phone: phoneNumber.number, }, {
            password: passhash
        }, {
            new: true
        });


        const token = await user.generateAuthToken()
        const responeDt = formatUser(user);

        res.status(200).send({ data: { ...responeDt, token }, token, err: false })
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})
//login api
customer_router.post('/users/login', async (req, res) => {
    //Login a registered user
    try {
        const { phone, password } = req.body
        const phoneNumber = parsePhoneNumber(phone, 'VN')

        const user = await Customer.findByCredentials(phoneNumber.number, password)
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
        res.status(400).send({ err: true, error })
            ;
        console.log('err login', error)
    }
})
//logout api
customer_router.post('/users/me/logout', auth, async (req, res) => {
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

customer_router.get('/customer/license/driver', auth, async (req, res) => {
    try {
        const { id } = req.query;
        console.log('id', id)
        const license = await License.findOne({ _id: id });

        res.send({ err: false, data: license })
    } catch (error) {
        res.status(500).send(error)
    }
})




module.exports = customer_router;
const express = require('express')
const Customer = require('../models/user')
const { auth, authWithoutData } = require('../middleware/auth')
const customer_router = express.Router()
const parsePhoneNumber = require('libphonenumber-js')
const { isValidPhoneNumber } = require('libphonenumber-js')
var admin = require("firebase-admin");
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const License = require('../../driver/models/license')
const https = require('https');

const jwt = require('jsonwebtoken');
const fs = require('fs')
const axios = require('axios')
const querystring = require('querystring')

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


const getClientSecret = () => {
    // sign with RSA SHA256
    const privateKey = fs.readFileSync('AuthKey_3L7NBT3P69.p8');
    const headers = {
        kid: '3L7NBT3P69',
        typ: undefined // is there another way to remove type?
    }
    const claims = {
        'iss': 'TL33VX6NK4',
        'aud': 'https://appleid.apple.com',
        'sub': 'com.hd.booking',
    }

    token = jwt.sign(claims, privateKey, {
        algorithm: 'ES256',
        header: headers,
        expiresIn: '24h'
    });

    return token
}

const getUserId = (token) => {
    const parts = token.split('.')
    try {
        return JSON.parse(new Buffer(parts[1], 'base64').toString('ascii'))
    } catch (e) {
        return null
    }
}
const verifyAppleID = (code) => {
    const clientSecret = getClientSecret();
    console.log("clientSecret", clientSecret)
    const requestBody = {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: '',
        client_id: 'com.hd.booking',
        client_secret: clientSecret,
        scope: "name email"
    }
    return new Promise(resolve => {
        axios.request({
            method: "POST",
            url: "https://appleid.apple.com/auth/token",
            data: querystring.stringify(requestBody),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(response => {
            resolve({
                user: getUserId(response.data.id_token),
                verified: true,
            })

        }).catch(error => {
            resolve({
                user: null,
                verified: false,
                err: error?.response?.data?.error_description
            })

        })
    })


}
// verify();
customer_router.post('/users/login/apple', async (req, res) => {
    try {
        const { apple_id, authorization_code } = req.body;
        let customer = await Customer.findOne({ apple_id: apple_id });
        if (customer) {
            const verify = await verifyAppleID(authorization_code);
            if (!verify?.verified) {
                res.status(200).send({ data: 'Cannot verify', err: true })
                return
            }
            const token = await customer.generateAuthToken()
            const responeDt = formatUser(customer);

            res.status(200).send({ data: { ...responeDt, token }, token, err: false })
        } else {
            res.status(200).send({ data: 'Customer not found', err: true })
        }
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })
    }
})

customer_router.post('/users/register/apple', async (req, res) => {
    try {
        const { apple_id, phone, authorization_code, name, authtoken } = req.body
        let isvalidate = isValidPhoneNumber(phone, 'VN');

        if (!phone) {
            res.status(404).send({ data: null, err: 'Missing Phone number' });
            return
        }

        if (!isvalidate) {
            res.status(404).send({ data: null, err: 'Phone number invalid' });
            return
        }
        const verify = await verifyAppleID(authorization_code);
        if (!verify?.verified) {
            res.status(200).send({ data: 'Cannot verify', err: true })
            return
        }
        const phoneNumber = parsePhoneNumber(phone, 'VN');

        let verifyFirebase = await admin.auth().verifyIdToken(authtoken);

        const bodyrequest = {
            "_id": new mongoose.Types.ObjectId(),
            phone: phoneNumber.number,
            join_date: Date.now(),
            is_active: true,
            name: name ? name : 'Người dùng ẩn danh',
            apple_id: apple_id,

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

customer_router.post('/users/login/facebook', async (req, res) => {
    try {

        const { access_token } = req.body;
        const options = {
            hostname: 'graph.facebook.com',
            port: 443,
            path: '/me?access_token=' + access_token,
            method: 'GET'
        }

        const request = https.get(options, response => {
            response.on('data', async function (user) {
                user = JSON.parse(user.toString());
                let customer = await Customer.findOne({ fb_id: user.id });
                if (customer) {
                    const token = await customer.generateAuthToken()
                    const responeDt = formatUser(customer);
                    res.status(200).send({ data: { ...responeDt, token }, token, err: false })
                } else {
                    res.status(200).send({ data: 'Customer not found', err: true, fb: user })
                }
                console.log("user", user);
            });
        })

        request.on('error', (message) => {
            console.log("error /users/login/facebook", message)
            res.status(400).send({ err: true, error: message })
        });

        request.end();
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })
    }
})
customer_router.post('/users/register/facebook', async (req, res) => {
    try {
        const { fb_id, phone, authtoken, name } = req.body
        let isvalidate = isValidPhoneNumber(phone, 'VN');

        if (!phone) {
            res.status(404).send({ data: null, err: 'Missing Phone number' });
            return
        }

        if (!isvalidate) {
            res.status(404).send({ data: null, err: 'Phone number invalid' });
            return
        }
        let verify = await admin.auth().verifyIdToken(authtoken);

        const phoneNumber = parsePhoneNumber(phone, 'VN');

        const bodyrequest = {
            "_id": new mongoose.Types.ObjectId(),
            phone: phoneNumber.number,
            join_date: Date.now(),
            is_active: true,
            name: name,
            fb_id: fb_id,

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


        let isvalidate = isValidPhoneNumber(req.body.phone, 'VN');

        if (!req.body.phone) {
            res.status(404).send({ data: null, err: 'Missing Phone number' });
            return
        }

        if (!isvalidate) {
            res.status(404).send({ data: null, err: 'Phone number invalid' });
            return
        }
        const tokenFirebase = req.body.token;
        let verify = await admin.auth().verifyIdToken(tokenFirebase);

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
    try {

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
    // update user info
    try {


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
        req.user.device_token = ''
        await req.user.save()
        res.send({ err: false, data: "success" })
    } catch (error) {
        res.status(500).send(error)
    }
})

// get thông tin xe bằng lái của tài xế
customer_router.get('/customer/license/driver', authWithoutData, async (req, res) => {
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
const express = require('express')
const Admin = require('../models/user')
const { auth, authWithoutData } = require('../middleware/auth')
const bcrypt = require('bcryptjs')


const adminRouter = express.Router()

adminRouter.post('/admin/login', async (req, res) => {
    try {
        const { name, password } = req.body
        const user = await Admin.findByCredentials(name, password);
        if (user == "wrong password") {
            return res.status(200).send({ err: true, data: "Wrong pass" })
        }
        if (!user) {
            return res.status(200).send({ err: true, data: "user not found" })
        }
        await user.generateAuthToken()
        res.status(200).send({ data: user, err: false })


    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }

})
adminRouter.post('/admin/logout', auth, async (req, res) => {
    try {
        req.user.token = '';
        await req.user.save();
        res.status(200).send({ data: 'ok', err: false })


    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }

})
const checkhash = "$2a$08$5KXhXDDbuprunjK3qGZT1Oqpu1uFgYBwmHTBxrnU103pw1/JFDLwK";
adminRouter.post('/admin/add', async (req, res) => {
    try {
        const { name, password, check } = req.body;
        const isok = bcrypt.compare(check, checkhash)
        if (!isok) {
            res.status(400).send({ err: true })
        }
        const hash = await bcrypt.hash(password, 8)

        const user = new Admin({
            name: name,
            password: hash,
            is_active: true,
            token: ''
        })
        await user.save();

        res.status(200).send({ data: 'ok', err: false })


    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }

})
module.exports = adminRouter;
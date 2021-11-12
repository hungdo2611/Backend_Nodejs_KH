const express = require('express')
const Transaction = require('../models/transaction')
const { auth, authWithoutData } = require('../middleware/auth')

const transaction_router = express.Router()

transaction_router.get('/transaction', authWithoutData, async (req, res) => {
    try {
        const { page_nunmber, page_size } = req.query;
        const transaction = await Transaction.paginate({ driver_id: req._id }, { page: page_nunmber, limit: page_size, sort: { $natural: -1 } });
        res.status(200).send({ err: false, data: transaction.docs, total: transaction.totalDocs })
    } catch (error) {
        console.log("error", error)
        res.status(400).send({ err: true, error })

    }
})

module.exports = transaction_router;
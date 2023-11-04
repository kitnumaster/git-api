const { validationResult } = require('express-validator/check')
const Account = require('../models/account')
const emailCtr = require('./email')

const GetAccounts = (req, res, next) => {
    // console.log(req)
    let query = {}
    if (req.query.requestDesigner) {
        query.requestDesigner = req.query.requestDesigner
    }
    if (req.query.email) {
        query.email = req.query.email
    }
    let dataDate = null
    if (req.query.createdAt) {
        dataDate = req.query.createdAt.split(":")
        date = moment(dataDate[0]).subtract(7, 'hours').format("YYYY-MM-DD")
        date2 = moment(dataDate[1]).format("YYYY-MM-DD")
        query.createdAt = {
            $gte: new Date(`${date} 17:00:00`),
            $lte: new Date(`${date2} 16:59:59`)
        }
    }
    let sort = {
        createdAt: -1
    }
    if (req.query.sortBy) {
        let sortBy = req.query.sortBy
        sort = {
            [sortBy]: req.query.sortType || -1
        }
    }
    // console.log(sort)
    if (req.userType == 'admin') {
        const currentPage = req.query.page || 1;
        const perPage = 30;
        let totalItems;
        Account.find(query)
            .countDocuments()
            .then(count => {
                totalItems = count
                return Account.find(query, {
                    password: 0
                })
                    .sort(sort)
                    .skip((currentPage - 1) * perPage)
                    .limit(perPage);
            })
            .then(accounts => {
                res.status(200).json({
                    message: 'Fetched successfully.',
                    accounts: accounts,
                    totalItems: totalItems,
                });
            })
            .catch(err => {
                if (!err.statusCode) {
                    err.statusCode = 500
                }
                next(err)
            })
    } else {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
}

const GetAccount = (req, res, next) => {
    let accountId = null
    if (req.userType == 'admin') {
        accountId = req.params.accountId
    } else {
        accountId = req.userId
    }
    Account.findById(accountId, {
        password: 0
    })
        .then(account => {
            if (!account) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ message: 'fetched.', account: account })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })

}

const UpdateAccount = (req, res, next) => {
    let accountId = null
    if (req.userType == 'admin') {
        accountId = req.params.accountId
    } else {
        accountId = req.userId
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const update = req.body.update
    Account.findById(accountId)
        .then(account => {
            if (!account) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }

            // console.log(update)
            if(update.requestDesigner){

                emailCtr.RegisterDesigner(account.email)

            }

            return Account.findByIdAndUpdate(accountId, update, { new: true })
        })
        .then(result => {
            res.status(200).json({ message: 'Updated!', account: result })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err);
        })
}

const ApproveAccount = (req, res, next) => {
    if (req.userType == 'admin') {
        const accountId = req.params.accountId
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed, entered data is incorrect.');
            error.statusCode = 422;
            throw error;
        }

        const userType = req.body.approve ? 2 : 1
        Account.findById(accountId)
            .then(account => {
                if (!account) {
                    const error = new Error('Could not find.');
                    error.statusCode = 404;
                    throw error;
                }

                account.userType = userType
                account.approveAt = new Date()
                //send email
                emailCtr.ApproveDesigner(account.email)
                return account.save()
            })
            .then(result => {
                res.status(200).json({ message: 'Updated!', account: result })
            })
            .catch(err => {
                if (!err.statusCode) {
                    err.statusCode = 500
                }
                next(err);
            })
    } else {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
}

module.exports = {
    GetAccounts,
    GetAccount,
    UpdateAccount,
    ApproveAccount,
}
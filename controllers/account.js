const { validationResult } = require('express-validator/check')
const Account = require('../models/account')

const GetAccounts = (req, res, next) => {
    // console.log(req)
    let query = {}
    if (req.query.requestDesigner) {
        query.requestDesigner = req.query.requestDesigner
    }
    if (req.userType == 'admin') {
        Account.find(query, {
            password: 0
        })
            .then(accounts => {
                res.status(200).json({
                    message: 'Fetched successfully.',
                    accounts: accounts,
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
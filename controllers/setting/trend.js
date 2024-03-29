const { validationResult } = require('express-validator/check')
const Trend = require('../../models/setting/trend')
const moment = require('moment')
const CreateTrend = (req, res, next) => {
    if (req.userType != 'admin') {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const trendName = req.body.trendName
    const trendNameTH = req.body.trendNameTH
    const trend = new Trend({
        trendName: trendName,
        trendNameTH: trendNameTH,
    })
    trend
        .save()
        .then(result => {
            res.status(201).json({
                message: 'Created successfully!',
                trend: trend
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        });
}

const GetTrends = (req, res, next) => {
    // if (req.userType != 'admin') {
    //     const error = new Error('Permission denied.');
    //     error.statusCode = 403;
    //     throw error;
    // }
    let query = {}
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
    Trend.find(query)
        .then(trends => {
            res.status(200).json({
                message: 'Fetched successfully.',
                trends: trends,
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const GetTrend = (req, res, next) => {
    if (req.userType != 'admin') {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
    const trendId = req.params.trendId
    Trend.findById(trendId)
        .then(trend => {
            if (!trend) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ message: 'fetched.', trend: trend })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const UpdateTrend = (req, res, next) => {
    if (req.userType != 'admin') {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
    const trendId = req.params.trendId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const trendName = req.body.trendName
    const trendNameTH = req.body.trendNameTH
    const active = req.body.active
    Trend.findById(trendId)
        .then(trend => {
            if (!trend) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            trend.trendName = trendName
            trend.trendNameTH = trendNameTH
            trend.active = active
            return trend.save()
        })
        .then(result => {
            res.status(200).json({ message: 'Updated!', trend: result })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err);
        })
}

module.exports = {
    CreateTrend,
    GetTrends,
    GetTrend,
    UpdateTrend,
}
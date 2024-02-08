const { validationResult } = require('express-validator/check')
const News = require('../models/news')
const moment = require('moment')

const CreateNews = (req, res, next) => {
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

    const topicEN = req.body.topicEN
    const topicTH = req.body.topicTH
    const user = req.userId
    const cover = req.body.cover
    const shortEN = req.body.shortEN
    const shortTH = req.body.shortTH
    const detailEN = req.body.detailEN
    const detailTH = req.body.detailTH
    const tags = req.body.tags
    const news = new News({
        topicEN: topicEN,
        topicTH: topicTH,
        user: user,
        cover: cover,
        shortEN: shortEN,
        shortTH: shortTH,
        detailEN: detailEN,
        detailTH: detailTH,
        tags: tags,
    })
    news
        .save()
        .then(result => {
            res.status(201).json({
                message: 'Created successfully!',
                news: news
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        });
}

const GetNewsLists = (req, res, next) => {
    let query = {
        newsPublic: true
    }
    if (req.userType == 'admin') {
        query = {
        }
    }
    if (req.query.tags) {
        query.tags = req.query.tags
    }
    if (req.query.newsPublic) {
        query.newsPublic = req.query.newsPublic
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
    const currentPage = req.query.page || 1;
    const perPage = 30;
    let totalItems;
    News.find(query)
        .countDocuments()
        .then(count => {
            totalItems = count;
            return News.find(query)
                .populate("user", {
                    name: 1,
                    password: 0,
                })
                .sort(sort)
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then(news => {
            res.status(200).json({
                message: 'Fetched successfully.',
                newsLists: news,
                totalItems: totalItems,
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const GetNews = (req, res, next) => {
    // if (req.userType != 'admin') {
    //     const error = new Error('Permission denied.');
    //     error.statusCode = 403;
    //     throw error;
    // }
    const newsId = req.params.newsId
    let query = {
        _id: newsId,
        newsPublic: true
    }
    if (req.userType == 'admin') {
        query = {
            _id: newsId,
        }
    }

    News.findOne(query)
        .populate("user", {
            name: 1,
            password: 0
        })
        .then(news => {
            if (!news) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ message: 'fetched.', news: news })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const UpdateNews = (req, res, next) => {
    if (req.userType != 'admin') {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
    const newsId = req.params.newsId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const topicEN = req.body.topicEN
    const topicTH = req.body.topicTH
    const cover = req.body.cover
    const shortEN = req.body.shortEN
    const shortTH = req.body.shortTH
    const detailEN = req.body.detailEN
    const detailTH = req.body.detailTH
    const newsPublic = req.body.newsPublic
    const tags = req.body.tags
    News.findById(newsId)
        .then(news => {
            if (!news) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            news.topicEN = topicEN
            news.topicTH = topicTH
            news.cover = cover
            news.shortEN = shortEN
            news.shortTH = shortTH
            news.detailEN = detailEN
            news.detailTH = detailTH
            news.newsPublic = newsPublic
            news.tags = tags
            return news.save()
        })
        .then(result => {
            res.status(200).json({ message: 'Updated!', news: result })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err);
        })
}

const DeleteNews = (req, res, next) => {
    if (req.userType != 'admin') {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
    const newsId = req.params.newsId
    let query = {
        news: newsId
    }
    if (req.userType && req.userType != 'admin') {
        query.account = req.userId
    }
    News.findOne(query)
        .then(cart => {
            if (!cart) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            // console.log(cart._id)
            return News.findByIdAndRemove(cart._id);
        })
        .then(result => {
            // console.log(result);
            res.status(200).json({ message: 'Deleted.' });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

module.exports = {
    CreateNews,
    GetNewsLists,
    GetNews,
    UpdateNews,
    DeleteNews
}
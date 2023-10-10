const { validationResult } = require('express-validator/check')
const HomePage = require('../models/homePage')

const CreateHomePage = (req, res, next) => {
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

    const name = req.body.name
    const files = req.body.files
    const link = req.link
    const type = req.body.type
    const homePage = new HomePage({
        name: name,
        files: files,
        link: link,
        type: type,
    })
    homePage
        .save()
        .then(result => {
            res.status(201).json({
                message: 'Created successfully!',
                homePage: homePage
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        });
}

const GetHomePageLists = (req, res, next) => {
    let query = {
        active: true
    }
    if (req.userType == 'admin') {
        query = {
        }
    }
    if (req.query.tags) {
        query.tags = req.query.tags
    }
    const currentPage = req.query.page || 1;
    const perPage = 30;
    let totalItems;
    HomePage.find(query)
        .countDocuments()
        .then(count => {
            totalItems = count;
            return HomePage.find(query)
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then(homePage => {
            res.status(200).json({
                message: 'Fetched successfully.',
                homePageLists: homePage,
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

const GetHomePage = (req, res, next) => {
    // if (req.userType != 'admin') {
    //     const error = new Error('Permission denied.');
    //     error.statusCode = 403;
    //     throw error;
    // }
    const homePageId = req.params.homePageId
    let query = {
        _id: homePageId,
        active: true
    }
    if (req.userType == 'admin') {
        query = {
            _id: homePageId,
        }
    }

    HomePage.findOne(query)
        .then(homePage => {
            if (!homePage) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ message: 'fetched.', homePage: homePage })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const UpdateHomePage = (req, res, next) => {
    if (req.userType != 'admin') {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
    const homePageId = req.params.homePageId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const name = req.body.name
    const files = req.body.files
    const link = req.body.link
    const type = req.body.type
    const active = req.body.active
    HomePage.findById(homePageId)
        .then(homePage => {
            if (!homePage) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            homePage.name = name
            homePage.files = files
            homePage.link = link
            homePage.type = type
            homePage.active = active
            return homePage.save()
        })
        .then(result => {
            res.status(200).json({ message: 'Updated!', homePage: result })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err);
        })
}

const DeleteHomePage = (req, res, next) => {
    if (req.userType != 'admin') {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
    const homePageId = req.params.homePageId
    let query = {
        homePage: homePageId
    }
    if (req.userType && req.userType != 'admin') {
        query.account = req.userId
    }
    HomePage.findOne(query)
        .then(cart => {
            if (!cart) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            // console.log(cart._id)
            return HomePage.findByIdAndRemove(cart._id);
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
    CreateHomePage,
    GetHomePageLists,
    GetHomePage,
    UpdateHomePage,
    DeleteHomePage
}
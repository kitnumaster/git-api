const { validationResult } = require('express-validator/check')
const Account = require('../models/account')
const Product = require('../models/product')
const DesignerViewLog = require('../models/log/designerViewLog')
const DesignerFavorite = require('../models/designer-favorite')

const GetDesigners = (req, res, next) => {

    let query = {
        userType: 2
    }
    let sort = {
        views: 1
    }
    if (req.query.firstNameSort) {
        sort = {
            firstName: req.query.firstNameSort
        }
    }
    if (req.query.viewSort) {
        sort = {
            views: req.query.viewSort
        }
    }
    const currentPage = req.query.page || 1;
    const perPage = 30;
    let totalItems;
    Account.find(query)
        .countDocuments()
        .then(count => {
            totalItems = count;
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
                designers: accounts,
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

const GetDesigner = (req, res, next) => {
    const designerId = req.params.designerId

    let loadAccount
    let products
    Account.findById(designerId, {
        "password": 0
    })
        .then(async account => {
            if (!account) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            loadAccount = account
            AddDesignerViewLog(req.userId || null, designerId, req.ipAddresses || null)

            products = await Product.find({
                account: designerId
            }, {
                "files": 0
            })
                .populate("material", {
                    materialName: 1,
                })
                .populate("housing", {
                    housingName: 1,
                })
                .populate("trend", {
                    trendName: 1,
                })
                .populate("fileType", {
                    fileTypeName: 1,
                })
                .populate("jewerlyType", {
                    jewerlyTypeName: 1,
                })
                .populate("detail", {
                    detailName: 1,
                })
                .populate("set", {
                    setName: 1,
                })
                .sort({
                    sold: 1,
                    createdAt: -1
                })

        })
        .then(result => {
            res.status(200).json({
                message: 'fetched.',
                designer: loadAccount,
                products: products
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const AddDesignerViewLog = async (account, designerId, IP) => {
    // console.log('ok')
    let obj = {
        account: account,
        designer: designerId,
        IP: IP
    }
    // console.log(obj)
    const designerViewLog = new DesignerViewLog(obj)

    await designerViewLog.save()
        .then(result => {

            //add view
            Account.findById(designerId, {
                views: 1
            })
                .then(async account => {
                    // console.log(account)
                    await Account.findByIdAndUpdate(designerId, {
                        views: account.views + 1
                    }, { new: true })


                })

        })

}

const AddDesignerFavorite = (req, res, next) => {
    console.log(req.body)
    const account = req.userId
    const designer = req.body.designer

    DesignerFavorite.findOne({
        account: account,
        designer: designer
    })
        .then(async designerFavorite => {
            if (!designerFavorite) {

                const designerFav = new DesignerFavorite({
                    account: account,
                    designer: designer
                })
                await designerFav
                    .save()

            }
            res.status(200).json({
                message: 'Successfully.',
            })
        })


}

const DeleteDesignerFavorite = (req, res, next) => {

    const account = req.userId
    const designer = req.params.designerId

    DesignerFavorite.findOne({
        account: account,
        designer: designer
    })
        .then(async designerFavorite => {
            // console.log(designerFavorite)
            if (designerFavorite) {
                await DesignerFavorite.findByIdAndRemove(designerFavorite._id);
            }

            return true
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

const GetDesignerFavorites = (req, res, next) => {

    let query = {}
    if (req.userType && req.userType == 2) {
        query.account = req.userId
    }
    const currentPage = req.query.page || 1;
    const perPage = 30;
    let totalItems;
    DesignerFavorite.find(query)
        .countDocuments()
        .then(count => {
            totalItems = count;
            return DesignerFavorite.find(query)
                .populate("account", {
                    password: 0
                })
                .populate("designer", {
                    password: 0
                })
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then(designerFavorites => {
            res.status(200).json({
                message: 'Fetched successfully.',
                designerFavorites: designerFavorites,
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


module.exports = {
    GetDesigners,
    GetDesigner,
    AddDesignerFavorite,
    DeleteDesignerFavorite,
    GetDesignerFavorites,
}
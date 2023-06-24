const express = require('express');
const isAuth = require('../middleware/is-auth');
const router = express.Router();

// create
router.post(
    '/upload',
    (req, res, next) => {

        if (!req.file) {
            const error = new Error('No image provided.');
            error.statusCode = 422;
            throw error;
        }

        res.send({
            imageUrl: req.file.path
        })

    }
);

module.exports = router;

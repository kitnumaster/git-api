const express = require('express');
const isAuth = require('../middleware/is-auth');
const router = express.Router();

router.post(
    '/upload',
    (req, res, next) => {

        // console.log(req)
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

const passport = require('passport')
const express = require('express')
const router = express.Router();
const FacebookStrategy = require('passport-facebook').Strategy
const CLIENT_ID = '1313164419573835'
const CLIENT_SECRET = 'a78bffd8e3e98b426296d643995c959a'
const Account = require('../models/account')
const auth = require('../controllers/auth')
passport.serializeUser(function (user, done) {
    done(null, user);
})
passport.deserializeUser(function (obj, done) {
    done(null, obj)
})
passport.use(new FacebookStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: "http://localhost:3004/auth/facebook/callback",
    profileFields: ['id', 'first_name', 'last_name', 'email', 'picture']
},
    async (accessToken, refreshToken, profile, done) => {
        console.log(profile)
        if (!profile._json.email) {
            return done({ message: 'Facebook Account is not registered with email. Please sign in using other methods' }, false)
        }
        // profile._json.email = "gg@mail.com" //test
        const userObj = {
            "email": profile._json.email,
            "userName": profile._json.email,
            "firstName": profile._json.first_name,
            "lastName": profile._json.last_name,
        }

        let loadUser
        const result = await Account.findOne({
            email: profile._json.email
        })
            .then(async user => {
                if (!user) {
                    console.log('create')
                    const account = new Account(userObj);
                    user = await account.save();
                }
                loadUser = user
                return auth.SetToken(user)
            })
        return done(null, result, loadUser._id.toString())
    }
))

router.get('/facebook', passport.authenticate('facebook', {
    scope: ['public_profile', 'email']
}))
router.get('/facebook/callback', (req, res, next) => {
    passport.authenticate('facebook', { session: false }, (err, token, userId) => {
        console.log(err, token)

        if (err || !token) {
            // let msg = err ? err.message : ""
            // const error = new Error(msg);
            // error.statusCode = 403;
            // throw error;
            res.status(400).json({ error: "someting" });
        } else {
            res.status(200).json({ token: token, userId: userId });
        }

    })(req, res, next)
})

module.exports = router;
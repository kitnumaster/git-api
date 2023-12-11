const express = require('express')
const router = express.Router()
const isAuth = require('../middleware/is-auth')
const { body } = require('express-validator/check')

const {
    CreateOrder,
    GetOrders,
    DeleteOrder,
    GetOrder,
    UpdateOrder,
    GetOrderProductOrders,
    DownloadProduct,
    CreditCardPayment,
} = require('../controllers/order')

const generatePassword = () => {
    var length = 24,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
};

// create
router.post(
    '/order',
    isAuth,
    CreateOrder
)
router.get('/orders', isAuth, GetOrders)
router.get('/my-orders', isAuth, GetOrders)
router.get('/order/:orderId', isAuth, GetOrder)
router.put('/order/:orderId', UpdateOrder)
router.delete('/order/:orderId', isAuth,
    DeleteOrder)
router.get('/my-sale-orders', isAuth, GetOrderProductOrders)
router.get('/product-download/:productId', isAuth, DownloadProduct)
router.post(
    '/enroll/payment-credit-card-success',
    CreditCardPayment
)

router.post(
    '/go-to-payment-card',
    (req, res, next) => {

        const axios = require("axios")
        let data = req.body
        const { order } = data;
        const body = {
            "access_key": process.env.MERCHANT_ACCESS_KEY || "bb47bf1d20833eaba29a5477ce518946",
            "profile_id": process.env.MERCHANT_PROFILE_ID || "EF16D9E3-DAC3-4F89-88B7-1D31BFDDA944",
            "transaction_uuid": generatePassword(),
            "signed_field_names": "access_key,profile_id,transaction_uuid,signed_field_names,unsigned_field_names,signed_date_time,locale,transaction_type,reference_number,amount,currency",
            "unsigned_field_names": "",
            "signed_date_time": new Date().toISOString(),
            "locale": "en",
            "transaction_type": "sale",
            "reference_number": order.orderNumber,
            "amount": order.totalPrice,
            "currency": "THB",
            // "card_type" : "001",
            // "card_number" : "4242424242424242",
            // "card_expiry_date" : "12-2030",
        }

        console.log("gotoPaymentCredit body", body);

        axios.post(process.env.CYBERPAY_BASE_URL || "https://testsecureacceptance.cybersource.com/pay", body, {}).then((res) => {
            console.log("gotoPaymentCredit res", res);
            if (res.data) {
                // window.location.href = res.data.redirect_url;
                res.redirect(res.data.redirect_url);
            }
        }).catch((err) => {
            showNotify(err.message, "error");
            closeModalPolicy.click();
            console.log("gotoPaymentCredit err", err);
        })
    })

module.exports = router

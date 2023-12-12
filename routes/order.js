const express = require('express')
const router = express.Router()
const isAuth = require('../middleware/is-auth')
const { body } = require('express-validator/check')

const multer = require('multer')
const upload = multer()

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
    const sec = Date.now() * 1000 + Math.random() * 1000;
    const id = sec.toString(16).replace(/\./g, "").padEnd(12, "0");
    return id;  
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
    upload.array(),
    CreditCardPayment
)

router.post(
    '/go-to-payment-card',
    (req, res, next) => {

        const axios = require("axios")
        let data = req.body
        const { order } = data;
        const body = {
            "access_key": "a2b0c0d0e0f0g0h0i0j0k0l0m0n0o0p2",
            "profile_id": "0FFEAFFB-8171-4F34-A22D-1CD38A28A384",
            "payment_method": "card",
            "transaction_uuid": generatePassword(),
            "signed_field_names": "access_key,profile_id,transaction_uuid,signed_field_names,unsigned_field_names,signed_date_time,locale,transaction_type,reference_number,amount,currency",
            "unsigned_field_names": "",
            "signed_date_time": new Date().toISOString(),
            "locale": "en",
            "transaction_type": "authorization",
            "reference_number": order.orderNumber,
            "amount": order.totalPrice,
            "currency": "THB",
            "signature": "a2b0c0d0e0f0g0h0i0j0k0l0m0n0o0p2", // คำนวนจากค่าที่ส่งมาทั้งหมด
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
            console.log("gotoPaymentCredit err", err);
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
    })

module.exports = router

const nodemailer = require('nodemailer')
const User = require('../models/user')

const TestSendEmail = async (req, res, next) => {

    const subject = req.body.subject || "Hello from sender"
    const msg = req.body.msg || "<b>Do you receive this mail?</b>"
    const to = req.body.to
    const result = await SendEmail(subject, msg, to)

    res.status(200).json({
        message: result,
    })
}

const SendEmail = async (subject, msg, to, bcc = []) => {

    // Email: webmaster @git.or.th
    // Password: 2566#Web@th
    // Host: smtp.office365.com
    // Port: 587
    // EnableSsl = True
    // UseDefaultCredentials = False

    const transporter = nodemailer.createTransport({
        // host: "smtp.office365.com",
        // port: 587,
        // secure: true,
        service: "Outlook365",
        auth: {
            user: 'webmaster@git.or.th',
            pass: '2566#Web@th'
        },
        // tls: {
        //     ciphers: 'SSLv3'
        // }
        // auth: {
        //     user: 'kitnudrago@gmail.com',
        //     pass: 'ebhn eneu nyvd pcgm'
        // }
    })

    let mailOptions = {
        from: 'webmaster@git.or.th',
        to: to,
        bcc: bcc,
        subject: subject,
        html: msg
    }

    await transporter.sendMail(mailOptions, function (err, info) {
        if (err)
            console.log(err + "err")
        else
            console.log(info)
    })
}

const getMailAdmin = async () => {

    let admins = await User.find({}, {
        email: 1
    })

    let email = []

    for (let i of admins) {
        email.push(i.email)
    }

    return email

}

const NewUser = async (to, userName, activateCode) => {

    let adminEmail = await getMailAdmin()
    let subject = "[GIT Jewely Design Gallery] New User Registration"

    let userFullName = userName
    let activateUrl = 'https://designgallery.git.or.th:3004/account/activate/' + activateCode;
    let msg = "ยินดีต้อนรับสู่ GIT Jewely Design Gallery, " + userFullName + "." + "<br>" + "กรุณาคลิกลิ้งด้านล่างเพื่อ activate บัญชีของคุณ" + "<br>" + "<br>" + "ลิ้งค์สำหรับ activate บัญชี : <a href='" + activateUrl + "'>" + activateUrl + "</a><br>" + "<br>" + "ขอบคุณค่ะ," + "<br>" + "GIT Jewely Design Gallery Team <br><br>"
        msg +="Welcome to GIT Jewely Design Gallery, " + userFullName + "." + "<br>" + "Please click the link below to activate your account." + "<br>" + "<br>" + "New user link activate : <a href='" + activateUrl + "'>" + activateUrl + "</a><br>" + "<br>" + "Thank you," + "<br>" + "GIT Jewely Design Gallery Team"

    SendEmail(subject, msg, to, adminEmail)
}

const RegisterDesigner = async (to, userFullName = "") => {

    let adminEmail = await getMailAdmin()
    let subject = "[GIT Jewely Design Gallery] Designer Registration"
    // let userFullName = userName
    let msg = "สวัสดี, คุณ" + userFullName + "<br>" + "<br>" + "คุณได้สมัครสมาชิกเป็นนักออกแบบ ของ GIT Jewely Design Gallery." + "<br>" + "กรุณารอการติดต่อกลับของแอดมิน เพื่ออนุมัติการสมัครสมาชิคของท่าน" + "<br>" + "<br>" + "ขอบคุณค่ะ," + "<br>" + "GIT Jewely Design Gallery Team <br><br>"
        msg += "Hello, " + userFullName + "<br>" + "<br>" + "You have been registered as a designer in GIT Jewely Design Gallery." + "<br>" + "Please wait for the administrator to approve your registration." + "<br>" + "<br>" + "Thank you," + "<br>" + "GIT Jewely Design Gallery Team"

    // console.log(adminEmail)

    SendEmail(subject, msg, to, adminEmail)

}

const ApproveDesigner = async (to, userFullName = "") => {

    let subject = "[GIT Jewely Design Gallery] Approve Designer"
    // let userFullName = "";
    let msg = "ขอแสดงความยินดีกับ, คุณ" + userFullName + "<br>" + "<br>" + "คุณได้รับการอนุมัติเป็นนักออกแบบ ของ GIT Jewely Design Gallery." + "<br>" + "<br>" + "ขอบคุณค่ะ," + "<br>" + "GIT Jewely Design Gallery Team <br><br>"
        msg += "Congratulations, " + userFullName + "<br>" + "<br>" + "you have been approved as a designer in GIT Jewely Design Gallery." + "<br>" + "<br>" + "Thank you," + "<br>" + "GIT Jewely Design Gallery Team"

    // console.log(adminEmail)

    SendEmail(subject, msg, to)

}

const NewOrder = async (to, userFullName, orderId, orderNumber, orderCreateDate, paymentMethod, paymentAmount) => {

    let adminEmail = await getMailAdmin()
    let subject = "[GIT Jewely Design Gallery] New Order Confirmation"
    // userFullName = userFullName;
    // orderId = "";
    // orderNumber = "";
    // orderCreateDate = "";
    // paymentMethod = 1; // 1 = tranfer, 2 = credit card
    let paymentMethodTxt = paymentMethod == 1 ? "โอนเงินผ่านบัญชีธนาคาร" : "บัตรเครดิต"
    // paymentAmount = "";
    let PaymentStatus = 1;
    let paymentConfirmUrl = "https://designgallery.git.or.th/paymentconfirm?order=" + orderId;
    let msg = "เรียน, คุณ" + userFullName + "." + "<br>" + "<br>" + "ขอบคุณสำหรับคำสั่งซื้อ" + "<br>" + "<br>" + "หมายเลขคำสั่งซื้อคือ " + orderNumber + "." + "<br>" + "วันที่สั่งซื้อ: " + orderCreateDate + "." + "<br>" + "<br>"
    msg += "<br>" + "<br>" + "รูปแบบการชำระเงิน: " + paymentMethodTxt + "." + "<br>" + "ยอดเงิน: ฿" + paymentAmount + "."
    if (paymentMethod == 1) {
        msg += "<br>" + "<br>" + "กรุณาโอนเงินชำระค่าสินค้าได้ที่" + "<br>" + "<br>" + "ธนาคารไทยพาณิชย์ สาขาปาโซ่ทาวเวอร์" + "<br>" + "ชื่อบัญชี: สถาบันวิจัยและพัฒนาอัญมีและเครื่องประดับแห่งชาติ (องค์การมหาชน)" + "<br>" + "หมายเลขบัญชี: 245-207440-3"
        msg += "<br>" + "<br>" + "เมื่อชำระค่าสินค้าเรียบร้อยแล้วกรุณา แจ้งชำระเงินได้ที่" + "<br>" + "<br>" + "<a href='" + paymentConfirmUrl + "'>คลิกเพื่อแจ้งชำระเงินค่าสินค้า</a>"
    }
    msg += "<br>" + "<br>" + "ขอบคุณค่ะ," + "<br>" + "GIT Jewely Design Gallery Team <br><br>"

    msg += "Dear, " + userFullName + "." + "<br>" + "<br>" + "Thank you for your order" + "<br>" + "<br>" + "Your order number is " + orderNumber + "." + "<br>" + "Order date: " + orderCreateDate + "." + "<br>" + "<br>"
    msg += "<br>" + "<br>" + "Payment Method: " + paymentMethodTxt + "." + "<br>" + "Payment amount: ฿" + paymentAmount + "."
    if (paymentMethod == 1) {
        msg += "<br>" + "<br>" + "Please transfer money to the following account." + "<br>" + "<br>" + "Bank: Siam Commercial Bank Public Company Limited" + "<br>" + "Account Name: The Gem and Jewelry Institute of Thailand (Public Organization)" + "<br>" + "Account Number: 245-207440-3"
        msg += "<br>" + "<br>" + "Please send a copy of the payment slip to confirm the payment." + "<br>" + "<br>" + "<a href='" + paymentConfirmUrl + "'>Confirem payment Click Here</a>"
    }
    msg += "<br>" + "<br>" + "Thank you," + "<br>" + "GIT Jewely Design Gallery Team"
    // console.log(adminEmail)

    SendEmail(subject, msg, to, adminEmail)

}

const OrderTranfer = async (to, orderNumber, orderCreateDate, paymentSlip, paymentDate, paymentAmount) => {

    let adminEmail = await getMailAdmin()
    let subject = "[GIT Jewely Design Gallery] Payment Confirmation"
    // orderNumber = "";
    // orderCreateDate = "";
    // paymentSlip = "";
    // paymentDate = "";
    // paymentAmount = "";
    // let msg = "Payment Confirmation" + "<br>" + "<br>" + "Order number: " + orderNumber + "." + "<br>" + "Order date: " + orderCreateDate + "." + "<br>" + "<br>" + "Payment Slip: " + paymentSlip + "." + "<br>" + "Payment date " + paymentDate + "." + "<br>" + "Payment amount: ฿" + paymentAmount + "." + "<br>" + "<br>" + "Please Check Payment Information and Approve" + "<br>" + "<br>" + "Thank you," + "<br>" + "GIT Jewely Design Gallery Team"

    let msg = "แจ้งชำระเงิน" + "<br>" + "<br>" + "หมายเลขคำสั่งซื้อ: " + orderNumber + "." + "<br>" + "วันที่สั่งซื้อ: " + orderCreateDate + "." + "<br>" + "<br>" + "วันที่ชำระเงิน:" + paymentDate + "." + "<br>" + "ยอดเงิน:" + paymentAmount + "บาท" + "<br>" + "<br>" + "กรุราตรวจสอบยอดชำระ และ อนุมัติคำสั่งซื้อ" + "<br>" + "<br>" + "ขอบคุณค่ะ," + "<br>" + "GIT Jewely Design Gallery Team <br><br>"
        msg += "Payment Confirmation" + "<br>" + "<br>" + "Order number: " + orderNumber + "." + "<br>" + "Order date: " + orderCreateDate + "." + "<br>" + "<br>" + "Payment date: " + paymentDate + "." + "<br>" + "Payment amount: ฿" + paymentAmount + "." + "<br>" + "<br>" + "Please Check Payment Information and Approve" + "<br>" + "<br>" + "Thank you," + "<br>" + "GIT Jewely Design Gallery Team"

    // console.log(adminEmail)

    SendEmail(subject, msg, to, adminEmail)

}

const ApproveOrderTranfer = async (to, userFullName, orderNumber, orderCreateDate, paymentSlip, paymentDate) => {
    let OrderUrl = "https://designgallery.git.or.th/myprofile/orders"
    let subject = "[GIT Jewely Design Gallery] Approve Payment Confirmation"
    // let userFullName = "";
    // let orderNumber = "";
    // let orderCreateDate = "";
    // let paymentSlip = "";
    // let paymentDate = "";
    // let paymentAmount = "";
    let msg = "เรียน, คุณ" + userFullName + "." + "<br>" + "<br>" + "รายการแจ้งชำระเงินของคุณได้รับการอนุมัติเรียบร้อยแล้ว." + "<br>" + "<br>" + "หมายเลขคำสั่งซื้อ: " + orderNumber + "." + "<br>" + "วันที่สั่งซื้อ: " + orderCreateDate + "." + "<br>" + "<br>" + "วันที่อนุมัติ: " + paymentDate + "." + "<br>" + "<br>" + "คุณสามารถดาวน์โหลดผลงานการออกแบบได้ที่หน้า <a href='" + OrderUrl + "'>คำสั่งซื้อ</a>" + "<br>" + "<br>" + "ขอบคุณค่ะ," + "<br>" + "GIT Jewely Design Gallery Team <br><br>"
        msg += "Dear, " + userFullName + "." + "<br>" + "<br>" + "Your payment has been approved." + "<br>" + "<br>" + "Order number: " + orderNumber + "." + "<br>" + "Order date: " + orderCreateDate + "." + "<br>" + "<br>" + "Payment approved date: " + paymentDate + "." + "<br>" + "<br>" + "Your can download a Desing in your <a href='" + OrderUrl + "'>Order Page</a>" + "<br>" + "<br>" + "Thank you," + "<br>" + "GIT Jewely Design Gallery Team"

    // console.log(adminEmail)

    SendEmail(subject, msg, to)

}

const ApproveDesignerOrderTranfer = async (to, userFullName, summaryNumber, orderRang, paymentDate, paymentAmount) => {

    let subject = "[GIT Jewely Design Gallery] Approve Payment to Designer"
    // let userFullName = "";
    // let orderNumber = "";
    // let orderCreateDate = "";
    // let orderRang = "";
    // let paymentSlip = "";
    // let paymentDate = "";
    // let paymentAmount = "";
    let msg = "เรียน, คุณ" + userFullName + "." + "<br>" + "<br>" + "รายการรายได้ของคุณได้รับการชำระเงินเรียบร้อยแล้ว." + "<br>" + "<br>" + "หมายเลข: " + summaryNumber + "." + "<br>" + "<br>" + "ช่วงวันที่คำนวณยอด:" + orderRang + "." + "<br>" + "<br>" + "วันที่ชำระ: " + paymentDate + "." + "<br>" + "ยอดรวมรายรับ: ฿" + paymentAmount + "." + "<br>" + "<br>" + "ขอบคุณค่ะ," + "<br>" + "GIT Jewely Design Gallery Team  <br><br>"
        msg += "Dear, " + userFullName + "." + "<br>" + "<br>" + "Your Summary Payment has been approved." + "<br>" + "<br>" + "Summary number: " + summaryNumber + "." + "<br>" + "<br>" + "Date Period:" + orderRang + "." + "<br>" + "<br>" + "Payment date: " + paymentDate + "." + "<br>" + "Payment amount: ฿" + paymentAmount + "." + "<br>" + "<br>" + "Thank you," + "<br>" + "GIT Jewely Design Gallery Team"

    // console.log(adminEmail)

    SendEmail(subject, msg, to)

}

const ResetPassword = async (to, newPassword) => {

    let subject = "คุณได้ขอเปลี่ยนรหัสผ่าน"
    let msg = `คุณได้ขอเปลี่ยนรหัสผ่าน รหัสผ่านใหม่ของคุณคือ <b>${newPassword} </b>` + "<br> เมื่อคุณเข้าสู่ระบบแล้วกรุณาเปลี่ยนรหัสผ่านใหม่ <br><br>" + "ขอบคุณค่ะ," + "<br>" + "GIT Jewely Design Gallery Team  <br><br>"
        msg += `You have requested to change your password. Your new password is<b> ${newPassword}</b>` +"<br> Once you have logged in, please change your password. <br><br>" + "Thank you," + "<br>" + "GIT Jewely Design Gallery Team  <br><br>"
    // console.log(adminEmail)

    SendEmail(subject, msg, to)

}

const EmailContact = async (req, res, next) => {

    const subject = req.body.subject
    const msg = req.body.msg
    const to = req.body.to ? req.body.to : 'jewelry@git.or.th'
    const result = await SendEmail(subject, msg, to)
    res.status(200).json({
        message: 'OK',
    })
}

module.exports = {
    SendEmail,
    TestSendEmail,
    NewUser,
    RegisterDesigner,
    ApproveDesigner,
    NewOrder,
    OrderTranfer,
    ApproveOrderTranfer,
    ApproveDesignerOrderTranfer,
    ResetPassword,
    EmailContact,
}
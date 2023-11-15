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

const NewUser = async (to, activateCode) => {

    let adminEmail = await getMailAdmin()
    let subject = "New user"
    let msg = "New user link activate : " + 'localhost:3004/account/activate/' + activateCode
    // console.log(adminEmail)

    SendEmail(subject, msg, to, adminEmail)

}

const RegisterDesigner = async (to) => {

    let adminEmail = await getMailAdmin()
    let subject = "RegisterDesigner"
    let msg = "RegisterDesigner"

    // console.log(adminEmail)

    SendEmail(subject, msg, to, adminEmail)

}

const ApproveDesigner = async (to) => {

    let subject = "ApproveDesigner"
    let msg = "ApproveDesigner"

    // console.log(adminEmail)

    SendEmail(subject, msg, to)

}

const NewOrder = async (to) => {

    let adminEmail = await getMailAdmin()
    let subject = "NewOrder"
    let msg = "NewOrder"

    // console.log(adminEmail)

    SendEmail(subject, msg, to, adminEmail)

}

const OrderTranfer = async (to) => {

    let adminEmail = await getMailAdmin()
    let subject = "OrderTranfer"
    let msg = "OrderTranfer"

    // console.log(adminEmail)

    SendEmail(subject, msg, to, adminEmail)

}

const ApproveOrderTranfer = async (to) => {

    let subject = "ApproveOrderTranfer"
    let msg = "ApproveOrderTranfer"

    // console.log(adminEmail)

    SendEmail(subject, msg, to)

}

const ApproveDesignerOrderTranfer = async (to) => {

    let subject = "ApproveDesignerOrderTranfer"
    let msg = "ApproveDesignerOrderTranfer"

    // console.log(adminEmail)

    SendEmail(subject, msg, to)

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
    ApproveDesignerOrderTranfer
}
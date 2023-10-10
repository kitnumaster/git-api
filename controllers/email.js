const nodemailer = require('nodemailer')

const TestSendEmail = async (req, res, next) => {

    const subject = req.body.subject || "Hello from sender"
    const msg = req.body.msg || "<b>Do you receive this mail?</b>"
    const to = req.body.to
    const result = await SendEmail(subject, msg, to)

    res.status(200).json({
        message: result,
    })
}

const SendEmail = async (subject, msg, to) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'kitnudrago@gmail.com',
            pass: 'ebhn eneu nyvd pcgm'
        }
    })

    let mailOptions = {
        from: 'sender@git.com',
        to: to,
        subject: subject,
        html: msg
    }

    await transporter.sendMail(mailOptions, function (err, info) {
        if (err)
            console.log(err)
        else
            console.log(info)
    })
}

module.exports = {
    SendEmail,
    TestSendEmail,
}
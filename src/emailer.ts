import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service:"gmail",

    auth:{
        user:"avishrmadaan@gmail.com",
        pass:"ofdg svit dfhs igco"
    }
})

export const sendWelcomeEmail = async (email:string) => {

    try {

        const info = await transporter.sendMail({

            from:"",
            to:email,
            subject:"Welcome to our world",
            text:`
Dear User,

Welcome to the Tweetly family! We're excited to have you on board.

You have successfully registered with the email address: ${email}. We're here to help you make the most out of your experience with Tweetly.

If you have any questions or need assistance, don't hesitate to reach out to our support team or visit our Help Center.

In the meantime, feel free to explore your account and start using Tweetly. You can access your dashboard by clicking the link below:

https:/localhost:3000/dashboard/home

Thank you for choosing Tweetly. We look forward to helping you achieve great things.

Best regards,
The Tweetly Team

If you did not sign up for this account, please disregard this email.
    `
        })

        console.log("Email sent: " + info.response)
    }
    catch(e) {

        console.error("Error sending email", e);


    }
}
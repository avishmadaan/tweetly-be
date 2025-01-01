"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetConfirmationEmail = exports.sendPasswordResetEmail = exports.sendOTPEmail = exports.sendWelcomeEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: "avishrmadaan@gmail.com",
        pass: "ofdg svit dfhs igco"
    }
});
const sendWelcomeEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const info = yield transporter.sendMail({
            from: "avishrmadaan@gmail.com",
            to: email,
            subject: "Welcome to our world",
            text: `
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
        });
        console.log("Email sent: " + info.response);
    }
    catch (e) {
        console.error("Error sending email", e);
    }
});
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendOTPEmail = (email, OTP) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const info = yield transporter.sendMail({
            from: "Tweetly Support",
            to: email,
            subject: `Your OTP Code: ${OTP}`,
            text: `
  Dear User,
  
  Thank you for signing up with Tweetly. 
  
  Your OTP code for email verification is: ${OTP}
  
  Please enter this code on the verification page to complete your sign-up process.
  
  If you did not request this OTP, please ignore this email.
  
  Best regards,
  The Tweetly Team
        `,
        });
        console.log("Email sent: " + info.response);
    }
    catch (e) {
        console.error("Error sending email", e);
    }
});
exports.sendOTPEmail = sendOTPEmail;
const sendPasswordResetEmail = (email, token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resetLink = `http://localhost:3000/login/passwordreset/newpassword?passresettoken=${token}&email=${encodeURIComponent(email)}`;
        const info = yield transporter.sendMail({
            from: "avishrmadaan@gmail.com", // Replace with your email address
            to: email,
            subject: "Password Reset Request - Tweetly",
            html: `
          <p>Dear User,</p>
  
          <p>We received a request to reset your password for your Tweetly account.</p>
          <p>You can reset your password by clicking the link below:</p>
  
          <a href="${resetLink}" target="_blank" style="color: blue; text-decoration: underline;">Reset Password</a>
          <br />
          This link is valid for only 30mins.
  
          <p>If you did not request this, please ignore this email.</p>
  
          <p>Best regards,<br>The Tweetly Team</p>
        `,
        });
        console.log("Email sent: " + info.response);
    }
    catch (e) {
        console.error("Error sending email", e);
    }
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendPasswordResetConfirmationEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const info = yield transporter.sendMail({
            from: '"Tweetly Support" <no-reply@tweetly.com>', // Replace with your email address
            to: email,
            subject: "Password Reset Successful - Tweetly",
            html: `
          <p>Dear User,</p>
  
          <p>Your password has been successfully reset.</p>
  
          <p>If you did not make this change, please contact our support team immediately.</p>
  
          <p>Best regards,<br>The Tweetly Team</p>
        `,
        });
        console.log("Confirmation email sent: " + info.response);
    }
    catch (e) {
        console.error("Error sending confirmation email", e);
    }
});
exports.sendPasswordResetConfirmationEmail = sendPasswordResetConfirmationEmail;

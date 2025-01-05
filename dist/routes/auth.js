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
const express_1 = require("express");
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = require("../config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_middleware_1 = __importDefault(require("../middlewares/auth-middleware"));
const emailer_1 = require("../emailer");
const passportConfig_1 = __importDefault(require("../configuration/passportConfig"));
const otpgeneration_1 = require("../utils/otpgeneration");
const userRouter = (0, express_1.Router)();
userRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requiredBody = zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8, { message: "Minimum length is 8" }).max(20).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/, {
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        })
    });
    const parsedData = requiredBody.safeParse(req.body);
    if (!parsedData.success) {
        res.status(411).json({
            message: "Error in inputs",
            error: parsedData.error,
        });
        return;
    }
    const email = req.body.email;
    const password = req.body.password;
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    try {
        yield config_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword
            }
        });
        // Send a welcome email without blocking the response
        (0, emailer_1.sendWelcomeEmail)(email).catch(err => {
            console.error("Failed to send welcome email:", err);
        });
        res.status(200).json({
            message: "Account Creation Success"
        });
    }
    catch (e) {
        //@ts-ignore
        if (e.code === "P2002") {
            res.status(409).json({
                message: "User already exists with this email"
            });
        }
        else {
            res.status(500).json({
                message: "Server error"
            });
        }
    }
}));
userRouter.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const password = req.body.password;
    const user = yield config_1.prisma.user.findFirst({
        where: {
            email
        }
    });
    if (!user) {
        res.status(403).json({
            message: "User Does Not Exist"
        });
        return;
    }
    const comparePassword = yield bcrypt_1.default.compare(password, user.password);
    try {
        if (comparePassword) {
            console.log("userId Here");
            console.log(user.id);
            const token = jsonwebtoken_1.default.sign({
                id: user.id.toString(),
            }, config_1.JWT_SECRET);
            yield config_1.prisma.token.create({
                data: {
                    userId: user.id,
                    token: token
                }
            });
            res.status(200).json({
                message: "Signin Success",
                token
            });
        }
        else {
            res.status(411).json({
                message: "Incorrect Password"
            });
        }
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}));
userRouter.post("/logout", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.auth_token;
    if (!token) {
        res.status(404).json({ message: "Token Missing" });
        return;
    }
    try {
        yield config_1.prisma.token.deleteMany({
            where: {
                token
            }
        });
        req.session.destroy((err) => {
            if (err) {
                console.log("session destruction error", err);
                res.status(500).json({
                    message: "Failed To Log Out"
                });
            }
        });
        res.clearCookie("auth_token");
        res.clearCookie("connect.sid");
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}));
userRouter.post("/paid", auth_middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({
        message: "You accessed it "
    });
}));
userRouter.get("/google", passportConfig_1.default.authenticate("google", {
    scope: ["profile", "email"]
}));
userRouter.get("/google/callback", passportConfig_1.default.authenticate('google', { failureRedirect: "/login" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //This route runs whey are done with profile function ( basically last function)
    console.log("insde the last callback");
    try {
        const user = req.user;
        if (!user) {
            res.status(400).json({
                message: "User not found"
            });
            return;
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user.id }, config_1.JWT_SECRET, { expiresIn: '1d' });
        res.cookie("auth_token", token);
        yield config_1.prisma.token.create({
            data: {
                userId: user.id,
                token: token
            }
        });
        res.send(`
                <script>
                window.opener.postMessage({
                success:true, message:"Login Successfull"
                }, 'http://localhost:3000')
                window.close();

                </script>
                `);
    }
    catch (e) {
        console.log(e);
        // Return an error response
        res.send(`
            <script>
                window.opener.postMessage({ success: false, message:"Internal Server Error" }, 'http://localhost:3000');
                window.close();
            </script>
        `);
    }
}));
userRouter.post("/otp/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requiredBody = zod_1.z.object({
        name: zod_1.z.string().min(3, { message: "Minimum length is 3" }),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8, { message: "Minimum length is 8" }).max(20).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/, {
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        })
    });
    const parsedData = requiredBody.safeParse(req.body);
    if (!parsedData.success) {
        res.status(411).json({
            message: "Error in inputs",
            error: parsedData.error,
        });
        return;
    }
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    try {
        const user = yield config_1.prisma.user.findUnique({
            where: {
                email: email
            }
        });
        if (user) {
            res.status(409).json({
                message: "User already exists with this email"
            });
            return;
        }
        const otp = (0, otpgeneration_1.otpGenerator)(4);
        console.log("Here is the OTP: " + otp);
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        //10 mins time
        yield config_1.prisma.tempUser.upsert({
            where: {
                email: email
            },
            update: {},
            create: {
                name,
                email,
                password: hashedPassword,
                otp,
                otpExpiresAt: otpExpiresAt
            }
        });
        console.log("above otp email");
        yield (0, emailer_1.sendOTPEmail)(email, otp);
        res.status(200).json({
            message: "Proceed with OTP Verification",
            email
        });
    }
    catch (e) {
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}));
userRouter.post("/signup/verification", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const otp = req.body.otp;
    try {
        const tempUser = yield config_1.prisma.tempUser.findUnique({
            where: {
                email
            }
        });
        if (!tempUser) {
            res.status(404).json({
                message: "No Such User Exist"
            });
            return;
        }
        if (new Date() > tempUser.otpExpiresAt) {
            res.status(409).json({
                message: "OTP has Expired"
            });
            return;
        }
        if (tempUser.otp != otp) {
            res.status(411).json({
                message: "Invalid OTP"
            });
            return;
        }
        yield config_1.prisma.user.create({
            data: {
                name: tempUser.name,
                email,
                password: tempUser.password
            }
        });
        // Send a welcome email without blocking the response
        (0, emailer_1.sendWelcomeEmail)(email).catch(err => {
            console.error("Failed to send welcome email:", err);
        });
        yield config_1.prisma.tempUser.delete({
            where: {
                email
            }
        });
        res.status(200).json({
            message: "Account Creation Success"
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Server error"
        });
    }
}));
userRouter.post("/signup/verification/newotp", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        const otp = (0, otpgeneration_1.otpGenerator)(4);
        console.log("Here is the Regerated OTP: " + otp);
        if (!email) {
            res.status(404).json({
                message: "Invalid Request, Email is missing"
            });
            return;
        }
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        yield config_1.prisma.tempUser.update({
            where: {
                email
            },
            data: {
                email,
                otp,
                otpExpiresAt
            }
        });
        yield (0, emailer_1.sendOTPEmail)(email, otp);
        res.status(200).json({
            message: "OTP Resent Successfully"
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Server error"
        });
    }
}));
userRouter.post("/passwordreset", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email || " ";
    console.log("email :" + email);
    try {
        const user = yield config_1.prisma.user.findUnique({
            where: {
                email
            }
        });
        if (!user) {
            res.status(404).json({
                message: "User Does Not Exist"
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, config_1.JWT_SECRET, { expiresIn: '30m' });
        yield (0, emailer_1.sendPasswordResetEmail)(user.email, token);
        res.status(200).json({
            message: "Password Reset Email Sent",
            email
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Internal Server error"
        });
    }
}));
userRouter.post("/passwordreset/newpassword", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const token = req.headers.authorization;
    const password = req.body.password;
    if (!token) {
        res.status(401).json({ message: "Token missing" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        if (!decoded) {
            res.status(403).json({
                message: "Invalid Token"
            });
            return;
        }
        const user = yield config_1.prisma.user.findUnique({
            where: {
                //@ts-ignore
                id: decoded.id
            }
        });
        if (!user) {
            res.status(404).json({
                message: "User Does Not Exist"
            });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        yield config_1.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                password: hashedPassword
            }
        });
        yield (0, emailer_1.sendPasswordResetConfirmationEmail)(user.email);
        res.status(200).json({
            message: "Password Reset Successfull"
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Internal Server error"
        });
    }
}));
userRouter.get("/getuserdetail", auth_middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userID = req.userId;
    console.log(userID);
    try {
        const user = yield config_1.prisma.user.findUnique({
            where: {
                id: userID
            }
        });
        if (!user) {
            res.status(403).json({
                message: "User Does Not Exist"
            });
            return;
        }
        res.status(200).json({
            message: "Successfully Fetched Data",
            user
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Internal Server error"
        });
    }
}));
exports.default = userRouter;

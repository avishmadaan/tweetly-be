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
        res.status(200).json({
            message: "Account Creation Success"
        });
    }
    catch (e) {
        //@ts-ignore
        if (e.code === 11000) {
            res.status(411).json({
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
userRouter.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.default = userRouter;

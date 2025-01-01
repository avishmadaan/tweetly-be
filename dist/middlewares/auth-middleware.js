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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.cookies);
    const token = req.cookies.auth_token;
    console.log(token);
    if (!token) {
        res.status(401).json({ message: "Token missing" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        const storedToken = yield config_1.prisma.token.findUnique({
            where: {
                token
            }
        });
        if (!storedToken) {
            res.status(401).json({ message: "Token invalid or expired" });
            return;
        }
        if (decoded) {
            //@ts-ignore
            req.userId = decoded.id;
            next();
        }
        else {
            res.status(403).json({
                message: "You are not logged In"
            });
        }
    }
    catch (e) {
        console.log(e);
        res.status(401).json({ message: "Invalid token" });
    }
});
exports.default = authMiddleware;

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
const passportConfig_1 = __importDefault(require("../configuration/passportConfig"));
const auth_middleware_1 = __importDefault(require("../middlewares/auth-middleware"));
const config_1 = require("../config");
const twitterRouter = (0, express_1.Router)();
twitterRouter.use(auth_middleware_1.default);
twitterRouter.get("/auth/twitter", passportConfig_1.default.authenticate("twitter"));
twitterRouter.get("/auth/twitter/callback", passportConfig_1.default.authenticate("twitter", {
    failureRedirect: "/dashboard/home",
    // Redirect to dashboard after successful linking
}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.send(`
            <script>
            window.opener.postMessage({
            login:true, message:"X Login Successfull"
            }, 'http://localhost:3000')
            window.close();

            </script>
            `);
    }
    catch (e) {
        console.log(e);
        res.send(`
            <script>
                window.opener.postMessage({ login: false, message:"Internal Server Error" }, 'http://localhost:3000');
                window.close();
            </script>
        `);
    }
}));
twitterRouter.get("/twitter/accountinfo", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const userId = req.userID;
        const account = yield config_1.prisma.twitter.findFirst({
            where: {
                userId
            }
        });
        if (!account) {
            res.status(404).json({
                message: "No Twitter Account Found",
            });
            return;
        }
        res.status(201).json({
            message: "Account Details Fetched",
            account
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
}));
exports.default = twitterRouter;

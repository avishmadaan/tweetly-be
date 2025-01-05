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
const auth_middleware_1 = __importDefault(require("../middlewares/auth-middleware"));
const config_1 = require("../config");
const axios_1 = __importDefault(require("axios"));
const contentRouter = (0, express_1.Router)();
contentRouter.use(auth_middleware_1.default);
contentRouter.post("/add", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tweetId = req.body.tweetId;
        //@ts-ignore
        const userId = req.userId;
        const categorySelectedId = req.body.categoryId;
        const tweet = yield config_1.prisma.tweet.findFirst({
            where: {
                tweetId,
                userId,
            }
        });
        if (tweet) {
            console.log("tweet", tweet);
            res.status(409).json({
                message: "Tweet Alredy Exists",
            });
            return;
        }
        const response = yield axios_1.default.get(`https://react-tweet.vercel.app/api/tweet/${tweetId}`);
        const result = response.data;
        yield config_1.prisma.tweet.create({
            data: {
                tweetId,
                username: result.data.user.name,
                description: result.data.text,
                userId,
                categoryId: categorySelectedId || null
            },
        });
        res.status(200).json({
            message: "Tweet Saved successfully",
        });
    }
    catch (err) {
        res.status(403).json({
            message: "tweet does not exist",
            error: err,
        });
    }
}));
contentRouter.get("/gettweets", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const userId = req.userId;
        const tweets = yield config_1.prisma.tweet.findMany({
            where: {
                userId
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                category: true
            }
        });
        res.status(200).json({
            message: "Tweets Found",
            tweets: tweets
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error",
            error: err,
        });
    }
}));
contentRouter.delete("/deletetweet/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const userId = req.userId;
        const id = req.params.id;
        yield config_1.prisma.tweet.delete({
            where: {
                id,
                userId
            }
        });
        res.status(200).json({
            message: "Deletion Successfull"
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error",
            error: err,
        });
    }
}));
contentRouter.post("/addcategory", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const userId = req.userId;
        const categoryName = req.body.categoryName;
        if (!categoryName) {
            res.status(400).json({
                message: "Category Name Not Allowed"
            });
            return;
        }
        const existingCategory = yield config_1.prisma.category.findFirst({
            where: {
                name: categoryName,
                userId: userId
            }
        });
        if (existingCategory) {
            res.status(409).json({
                message: "Category Alredy Exist For User"
            });
            return;
        }
        const result = yield config_1.prisma.category.create({
            data: {
                name: categoryName,
                userId
            }
        });
        console.log(result);
        res.status(201).json({
            message: "Category Created Successfully",
            categoryId: result.id
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error",
            error: err,
        });
    }
}));
contentRouter.get("/getcategories", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const userId = req.userId;
        const categories = yield config_1.prisma.category.findMany({
            where: {
                userId
            }
            // ,
            // orderBy :{
            //   createdAt:'desc'
            // }
        });
        res.status(200).json({
            message: "Categories Found",
            categories
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error",
            error: err,
        });
    }
}));
contentRouter.delete("/deletecategory/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const userId = req.userId;
        const categoryId = req.params.id;
        const result = yield config_1.prisma.category.delete({
            where: {
                id: categoryId,
                userId: userId
            }
        });
        res.status(200).json({
            message: "Category Deletion Successfull"
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error",
            error: err,
        });
    }
}));
contentRouter.put("/categoryupdate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const userId = req.userId;
        const categoryId = req.body.categoryId;
        const tweetIdPrimary = req.body.tweetIdPrimary;
        yield config_1.prisma.tweet.update({
            where: {
                id: tweetIdPrimary,
                userId
            },
            data: {
                categoryId
            }
        });
        res.status(200).json({
            message: "Category Updated Successfully",
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error",
            error: err,
        });
    }
}));
exports.default = contentRouter;

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
// import { Router } from "express";
const auth_middleware_1 = __importDefault(require("../middlewares/auth-middleware"));
const config_1 = require("../config");
const express_1 = require("express");
const express_2 = require("uploadthing/express");
const uploadthing_1 = require("./uploadthing");
const postRouter = (0, express_1.Router)();
postRouter.use(auth_middleware_1.default);
postRouter.post("/createdraft", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const userId = req.userId;
        const timeNow = new Date();
        const result = yield config_1.prisma.post.create({
            data: {
                postContent: "",
                userId,
                updatedAt: timeNow
            }
        });
        res.status(201).json({
            message: "Draft Post Create Successfully",
            post: result
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
postRouter.put("/updatepost", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
}));
postRouter.get("/getalldrafts", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const userId = req.userId;
        const draftPosts = yield config_1.prisma.post.findMany({
            where: {
                userId,
                status: "DRAFT"
            }
        });
        res.status(200).json({
            message: "Draft Post Fetched Successfully",
            draftPosts
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
postRouter.delete("/deletepost/:postid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const userId = req.userId;
        const postId = req.params.postid;
        yield config_1.prisma.post.delete({
            where: {
                id: postId,
                userId
            }
        });
        res.status(200).json({
            message: "Post Deleted Successfully"
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
postRouter.use("/uploadthing", (0, express_2.createRouteHandler)({
    router: uploadthing_1.uploadRouter
}));
// const {createUploadThingAPI} = createUploadthing({
//     appId:UPLOADTHING_APP_ID,
//     secret:UPLOADTHING_SECRET
// })
// postRouter.post('/upload', async(req, res) => {
//     try {
//         const {files} = req.body;
//         if(!files) {
//             res.send(400).json({
//                 message:"No Files Provided"
//             })
//             return ;
//         }
//         if(files.length >4) {
//             res.send(400).json({
//                 message:"You can upload a maximum of 4 files"
//             })
//             return ;
//         }
//         const uploadResponse = await createUploadThingAPI({
//             files,
//             endpoint:'mediaUploader'
//         });
//         console.log(uploadResponse)
//         res.status(200).json({
//             link:uploadResponse
//         })
//     }
//     catch(err) {
//     }
// })
exports.default = postRouter;

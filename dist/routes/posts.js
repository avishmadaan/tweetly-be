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
postRouter.use("/uploadthing", (0, express_2.createRouteHandler)({
    router: uploadthing_1.uploadRouter,
    config: {
        token: process.env.UPLOADTHING_TOKEN
    }
}));
postRouter.use(auth_middleware_1.default);
postRouter.post("/createOrUpdatedraft", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const userId = req.userId;
        const postContent = req.body.postContent;
        const mediaFiles = req.body.mediaFiles;
        let draftPostId = req.body.postId;
        // const alreadyLinkedFiles:{id:string,postIds:string[]}[] = [];
        const fileIdsArr = [];
        mediaFiles.forEach((item) => {
            fileIdsArr.push(item.id);
        });
        const result = yield config_1.prisma.post.upsert({
            create: {
                postContent: postContent,
                userId,
                updatedAt: new Date(),
                fileIds: fileIdsArr
            },
            update: {
                postContent: postContent,
                userId,
                updatedAt: new Date(),
                fileIds: fileIdsArr
            },
            where: {
                id: draftPostId || "6796405c4e0ced1111111111"
            }
        });
        draftPostId = result.id;
        //now time for postid's fields in each of file cleanup
        const allMediaFilesHavingDraftPostId = yield config_1.prisma.file.findMany({
            where: {
                postIds: {
                    has: draftPostId
                }
            }
        });
        for (const file of allMediaFilesHavingDraftPostId) {
            yield config_1.prisma.file.update({
                where: {
                    id: file.id
                },
                data: {
                    postIds: file.postIds.filter((id) => id != draftPostId)
                }
            });
        }
        for (const file of mediaFiles) {
            yield config_1.prisma.file.update({
                where: {
                    id: file.id
                },
                data: {
                    postIds: {
                        push: draftPostId
                    }
                }
            });
        }
        res.status(201).json({
            message: "Saved As Draft",
            postId: draftPostId
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
            },
            include: {
                files: true
            },
            orderBy: {
                updatedAt: "desc"
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
postRouter.delete("/deletemediafrompost/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const userId = req.userId;
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error",
            error: err,
        });
    }
}));
postRouter.put("/movetodraft/:postid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const userId = req.userId;
        const postId = req.params.postid;
        yield config_1.prisma.post.update({
            where: {
                id: postId,
                userId
            },
            data: {
                status: "DRAFT"
            }
        });
        res.status(200).json({
            message: "Post Status Updated To Draft Successfully"
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
exports.default = postRouter;

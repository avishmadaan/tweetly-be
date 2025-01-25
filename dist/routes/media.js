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
const config_1 = require("../config");
const auth_middleware_1 = __importDefault(require("../middlewares/auth-middleware"));
const mediaRouter = (0, express_1.Router)();
mediaRouter.use(auth_middleware_1.default);
mediaRouter.post("/uploadmedia", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const userId = req.userId;
        const files = req.body.data;
        console.log(files);
        files.forEach((file) => __awaiter(void 0, void 0, void 0, function* () {
            console.log("insdie uploading");
            yield config_1.prisma.file.create({
                data: {
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size,
                    fileURL: file.url,
                    userId: userId
                }
            });
        }));
        res.status(201).json({
            message: "Media Uploaded Successfully",
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
mediaRouter.get("/getallmedia", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const userId = req.userId;
        const mediaFiles = yield config_1.prisma.file.findMany({
            where: {
                userId
            }
        });
        res.status(201).json({
            message: "Draft Post Create Successfully",
            files: mediaFiles
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
mediaRouter.delete("/deletemedia/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const userId = req.userId;
        const id = req.params.id;
        yield config_1.prisma.file.delete({
            where: {
                userId,
                id
            }
        });
        res.status(200).json({
            message: "Media Deletion Success"
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
exports.default = mediaRouter;

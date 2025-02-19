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
const aiRouter = (0, express_1.Router)();
aiRouter.use(auth_middleware_1.default);
aiRouter.post("/getcontext", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const embeddingVector = req.body.embeddingVector;
    const pipeline = [
        {
            $search: {
                index: "Tweet_Search", // your Atlas Search index name
                knnBeta: {
                    vector: embeddingVector, // your query vector
                    path: "embedding",
                    k: 5,
                },
            },
        },
        {
            $project: {
                tweet_id: 1,
                text: 1,
                likes: 1,
                retweets: 1,
                comments: 1,
                timestamp: 1,
                score: { $meta: "searchScore" },
            },
        },
    ];
    try {
        const result = yield config_1.prisma.$runCommandRaw({
            aggregate: "bottweets",
            pipeline,
            cursor: {}
        });
        const tweets = (_a = result.cursor) === null || _a === void 0 ? void 0 : _a.firstBatch;
        res.status(200).json({
            message: "Context Retrieved Successfully",
            context: tweets
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
aiRouter.get("/getbots", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bots = yield config_1.prisma.bot.findMany();
        res.status(200).json({
            message: "Bots Found",
            bots
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
exports.default = aiRouter;

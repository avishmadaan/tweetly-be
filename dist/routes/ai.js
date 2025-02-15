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
const astra_db_ts_1 = require("@datastax/astra-db-ts");
const aiRouter = (0, express_1.Router)();
aiRouter.use(auth_middleware_1.default);
aiRouter.post("/getcontext", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const embeddingVector = req.body.embeddingVector;
    const client = new astra_db_ts_1.DataAPIClient(config_1.ASTRA_DB_APPLICATION_TOKEN);
    const db = client.db(config_1.ASTRA_DB_API_ENDPOINT, { namespace: config_1.ASTRA_DB_NAMESPACE });
    try {
        const collection = yield db.collection(config_1.ASTRA_DB_COLLECTION);
        const cursor = yield collection.find({}, {
            sort: {
                $vector: embeddingVector
            },
            limit: 10
        });
        const documents = yield cursor.toArray();
        const docsMap = documents.map((doc) => doc.text);
        const docContext = JSON.stringify(docsMap);
        res.status(200).json({
            message: "Context Retrieved Successfully",
            context: docContext
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

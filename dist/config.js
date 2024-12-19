"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.PORT = exports.JWT_SECRET = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client_1 = require("@prisma/client");
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.PORT = process.env.PORT;
exports.prisma = new client_1.PrismaClient();
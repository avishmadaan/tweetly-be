import dotenv from "dotenv";
dotenv.config();
import {PrismaClient} from "@prisma/client"

export const JWT_SECRET = process.env.JWT_SECRET;
export const PORT = process.env.PORT;
export const prisma = new PrismaClient();

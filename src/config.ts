import dotenv from "dotenv";
dotenv.config();

import {PrismaClient} from "@prisma/client"


export const JWT_SECRET = process.env.JWT_SECRET;
export const PORT = process.env.PORT;
export const prisma = new PrismaClient();
export const SESSION_SECRET = process.env.SESSION_SECRET ;
export const GOOGLE_CLIENT_ID=process.env.GOOGLE_CLIENT_ID
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
export const BASE_URL =  process.env.BASE_URL
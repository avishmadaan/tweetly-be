import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET, prisma } from "../config";


const authMiddleware = async (req:Request, res:Response, next:NextFunction) => {
 
    const token = req.headers.authorization;
    if (!token) {
        res.status(401).json({ message: "Token missing" });
        return;
    }

    try {

        const decoded = jwt.verify(token as string, JWT_SECRET  as string);
        
        const storedToken = await prisma.token.findUnique({
            where:{
                token
            }
        })

        if (!storedToken) {
             res.status(401).json({ message: "Token invalid or expired" });
             return;
        }


        if(decoded){
            //@ts-ignore
            req.userId = decoded.id;
            next();
        }
    
        else {
            res.status(403).json({
                message:"You are not logged In"
            })
        }

    }

    catch(e) {
        console.log(e);
        res.status(401).json({ message: "Invalid token" });
        
    }

    
  

  };
  
  export default authMiddleware;
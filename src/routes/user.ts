import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcrypt"
import { JWT_SECRET, prisma } from "../config";
import jwt from "jsonwebtoken";
import authMiddleware from "../middlewares/auth-middleware";

const userRouter = Router();


userRouter.post("/signup", async (req, res) => {
 
    
    const requiredBody = z.object({
        email:z.string().email(),
        password:z.string().min(8, {message:"Minimum length is 8"}).max(20).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/, {
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        })

    })
    const parsedData = requiredBody.safeParse(req.body);
    
    if(!parsedData.success) {
        res.status(411).json({
            message:"Error in inputs",
            error: parsedData.error,
        })
        return;
    }

    const email = req.body.email;
    const password =  req.body.password;

    const hashedPassword = await bcrypt.hash(password,10);

    try {
        await prisma.user.create({
            data:{
                email,
                password:hashedPassword
            }
        })

        res.status(200).json({
            message:"Account Creation Success"
        })


    }

    catch(e:any){


        //@ts-ignore
        if(e.code === "P2002") {

            res.status(409).json({
             message:"User already exists with this email"
            })

        }

        else {

            res.status(500).json({
                message:"Server error"
               })

        }

    }



})


userRouter.post("/login", async (req, res)=> {

    const email = req.body.email;
    const password =  req.body.password;

    const user = await prisma.user.findFirst({
        where:{
            email
        }
    })

    if(!user) {

        res.status(403).json({
            message:"User Does Not Exist"
        });

        return;
    }

    const comparePassword = await bcrypt.compare(password, user.password as string)



    try {
   
        if(comparePassword) {

            console.log("userId Here")
            console.log(user.id);
            const token = jwt.sign({
               id: user.id.toString(),

            }, JWT_SECRET as string);

            await prisma.token.create({
                data:{
                    userId:user.id,
                    token:token
                    
                }
            })

            res.status(200).json({
                message:"Signin Success",
                token
            })
        }

        else {
            res.status(411).json({
                message:"Incorrect Password"
            })
        }

    }

    catch(e){
        console.log(e);

       res.status(500).json({
        message:"Internal Server Error"
       })
    }




    })

    userRouter.post("/logout", async (req, res)=> {

        const token = req.cookies.token;
        console.log(token,"here is token")

        if(!token) {
            res.status(404).json({ message: "Token Missing" });
            return ;
        }

        try {

            await prisma.token.deleteMany({
                where:{
                    token
                }
            })

            res.status(200).json({ message: "Logged out successfully" });

        }

        catch(e) {
            console.log(e);
            res.status(500).json({
                message:"Internal Server Error"
               })


        }
      
        


    })

    userRouter.post("/paid",authMiddleware, async (req, res)=> {

res.status(200).json({
    message:"You accessed it "
})

    })

    export default userRouter
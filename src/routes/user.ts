import { Request, Response, Router } from "express";
import { z } from "zod";
import bcrypt from "bcrypt"
import { JWT_SECRET, prisma } from "../config";
import jwt from "jsonwebtoken";
import authMiddleware from "../middlewares/auth-middleware";
import { sendWelcomeEmail } from "../emailer";
import passport from "../configuration/passportConfig"; 


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

          // Send a welcome email without blocking the response
          sendWelcomeEmail(email).catch(err => {
            console.error("Failed to send welcome email:", err);
        });

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

        const token = req.cookies.auth_token;
 

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

            req.session.destroy((err) => {
                if(err) {
                    console.log("session destruction error", err);

                    res.status(500).json({
                        message:"Failed To Log Out"
                    })
                }
            })

            res.clearCookie("auth_token");
            res.clearCookie("connect.sid")

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

    userRouter.get("/google", 
        
        passport.authenticate("google", {
            scope:["profile", "email"]
            
        })
        
    )


    userRouter.get("/google/callback",
        passport.authenticate('google', { failureRedirect: "/login" }),
       async  (req: Request, res: Response) => {
//This route runs whey are done with profile function ( basically last function)

console.log("insde the last callback")

try {


            const user = req.user as { id: string };  
    
            if (!user) {
                 res.status(400).json({ 
                    message: "User not found" 
                });
                 return ;
            }
    
            // Generate JWT token
            const token = jwt.sign(
                { id: user.id },
                JWT_SECRET as string, 
                { expiresIn: '1d' }
            );

            res.cookie("auth_token",token);
            await prisma.token.create({
                data:{
                    userId:user.id,
                    token:token
                    
                }
            })


            res.send(`
                <script>
                window.opener.postMessage({
                success:true, message:"Login Successfull"
                }, 'http://localhost:3000')
                window.close();

                </script>
                `)

        }

    
    catch(e) {

        console.log(e);
          // Return an error response
          res.send(`
            <script>
                window.opener.postMessage({ success: false, message:"Internal Server Error" }, 'http://localhost:3000');
                window.close();
            </script>
        `);


    }
  }  );


    export default userRouter
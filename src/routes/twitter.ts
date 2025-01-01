import { Request, Response, NextFunction, Router } from "express";
import passport from "../configuration/passportConfig"; 
import authMiddleware from "../middlewares/auth-middleware";
import { prisma } from "../config";


const twitterRouter = Router();
twitterRouter.use(authMiddleware)

twitterRouter.get(
    "/auth/twitter",
    
    passport.authenticate("twitter")
  );


  twitterRouter.get(
    "/auth/twitter/callback",
    
    passport.authenticate("twitter", {
        failureRedirect: "/dashboard/home",
       // Redirect to dashboard after successful linking
    }),  async  (req: Request, res: Response) => {

       try {

        res.send(`
            <script>
            window.opener.postMessage({
            login:true, message:"X Login Successfull"
            }, 'http://localhost:3000')
            window.close();

            </script>
            `)

       }

       catch(e) {

        console.log(e);
 
          res.send(`
            <script>
                window.opener.postMessage({ login: false, message:"Internal Server Error" }, 'http://localhost:3000');
                window.close();
            </script>
        `);

       }

    }
);


twitterRouter.get("/twitter/accountinfo", async (req: Request, res: Response) => {

    try {

    //@ts-ignore
    const userId = req.userID;

    const account = await prisma.twitter.findFirst({
        where:{
            userId
        }
    })

    if(!account) {
        res.status(404).json({
            message:"No Twitter Account Found",
        
        })
        return;
    }

    res.status(201).json({
        message:"Account Details Fetched",
        account

    })

}

catch(e) {
    console.log(e);
    res.status(500).json({
        message:"Internal Server Error",

    })


}
})


export default twitterRouter
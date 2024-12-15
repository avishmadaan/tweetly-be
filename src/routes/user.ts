import { Router } from "express";

const userRouter = Router();


userRouter.post("/signup", async (req, res) => {
    res.json({
        message:"signup success"
    })
    
    })

    export default userRouter
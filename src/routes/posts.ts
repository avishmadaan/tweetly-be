// import { Router } from "express";
import authMiddleware from "../middlewares/auth-middleware";
import { prisma, UPLOADTHING_APP_ID, UPLOADTHING_SECRET } from "../config";
import axios from "axios";
import {createUploadthing} from "uploadthing/server"
import { Router } from "express";
import { date } from "zod";
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "./uploadthing";

const postRouter = Router();


postRouter.use(
    "/uploadthing",
    createRouteHandler({
      router: uploadRouter,
      config:{
        token:process.env.UPLOADTHING_TOKEN
      }
 
    }),
  );

postRouter.use(authMiddleware);

postRouter.post("/createdraft", async ( req, res ) => {

    try {
        //@ts-ignore
        const userId = req.userId;
        const postContent = req.body.postContent;
        const mediaFiles:{id:string}[]= req.body.mediaFiles;
        const timeNow = new Date();

        const result = await prisma.post.create({
            data:{
                postContent:postContent,
                userId,
                updatedAt:timeNow
            }
        })

        mediaFiles.forEach(async (file) => {
            await prisma.file.update({
                where:{
                    id:file.id,
                    userId
                },
                data:{
                    userId,
                    postId:result.id
                }
            })
        })


        res.status(201).json({
            message:"Draft Post Create Successfully",
            post:result
        })

    }

    catch(err) {
        console.log(err);
    res.status(500).json({
        message: "Internal Server Error",
        error: err,
      });
    }

})

postRouter.put("/updatepost", async (req, res) => {


})

postRouter.get("/getalldrafts", async (req, res) => {

    try {
        //@ts-ignore
        const userId = req.userId;

        const draftPosts = await prisma.post.findMany({
            where:{
                userId,
                status:"DRAFT"
            },
            include:{
                file:true
            },
            orderBy:{
                updatedAt:"desc"
            }
        })

        res.status(200).json({
            message: "Draft Post Fetched Successfully",
            draftPosts
          });
        
    }

    catch(err) {
        console.log(err);
    res.status(500).json({
        message: "Internal Server Error",
        error: err,
      });
    }
})

postRouter.delete("/deletepost/:postid", async (req, res) => {

    try {
         //@ts-ignore
         const userId = req.userId;
         const postId = req.params.postid;

         await prisma.post.delete({
            where:{
                id:postId,
                userId
            }
         })

         res.status(200).json({
            message: "Post Deleted Successfully"
          });




    }
    catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error",
            error: err,
          });
    }

})






export default postRouter;
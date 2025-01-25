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

postRouter.post("/createOrUpdatedraft", async ( req, res ) => {

    try {
        //@ts-ignore
        const userId = req.userId;
        const postContent = req.body.postContent;
        const mediaFiles:{id:string}[]= req.body.mediaFiles;
        let draftPostId = req.body.postId;
        const timeNow = new Date();
        let alreadyLinkedFiles:{id:string}[] = [];

        if(draftPostId) {

           const result=  await prisma.post.update({
                where:{
                    id:draftPostId
                },
                data:{
                    postContent:postContent,
                    userId,
                    updatedAt:timeNow

                },
                include:{
                    file:true
                }
            })

            alreadyLinkedFiles = result.file;

        }
        else {

            const result = await prisma.post.create({
                data:{
                    postContent:postContent,
                    userId,
                    updatedAt:timeNow
                }
            })

            draftPostId = result.id;
        }

        alreadyLinkedFiles.forEach(async (file) => {

            await prisma.file.update({
                where:{
                    id:file.id
                },
                data:{
                    postId:null
                }
            })
        })



        mediaFiles.forEach(async (file) => {
            await prisma.file.update({
                where:{
                    id:file.id,
                    userId
                },
                data:{
                    userId,
                    postId:draftPostId
                }
            })
        })


        res.status(201).json({
            message:"Saved As Draft",
            postId:draftPostId
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

postRouter.delete("/deletemediafrompost/:id", async (req,res) => {
    try  {
         //@ts-ignore
         const userId = req.userId;

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
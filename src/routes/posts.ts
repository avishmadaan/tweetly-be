// import { Router } from "express";
import authMiddleware from "../middlewares/auth-middleware";
import { prisma } from "../config";
import { Router } from "express";
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "./uploadthing";
import { compareAsc, format, intlFormat } from "date-fns";

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
        const mediaFiles:{id:string, postIds:string[]}[]= req.body.mediaFiles;
        let draftPostId = req.body.postId;
    
        // const alreadyLinkedFiles:{id:string,postIds:string[]}[] = [];

        const fileIdsArr:string[] =[ ];
         mediaFiles.forEach((item) => {
            fileIdsArr.push(item.id);

        })

        const result = await prisma.post.upsert({
            create:{
                postContent:postContent,
                userId,
                updatedAt:new Date(),
                fileIds:fileIdsArr

            },
            update:{
                postContent:postContent,
                userId,
                updatedAt:new Date(),
                fileIds:fileIdsArr

            },
            where:{
                id:draftPostId || "6796405c4e0ced1111111111"
            }
        })

        draftPostId = result.id;

        //now time for postid's fields in each of file cleanup
        const allMediaFilesHavingDraftPostId = await prisma.file.findMany({
            where:{
                postIds: {
                    has:draftPostId
                }
            }
        })

        for(const file of allMediaFilesHavingDraftPostId) {
            await prisma.file.update({
                where:{
                    id:file.id
                },
                data:{
                    postIds: file.postIds.filter((id) => id != draftPostId)
                }

            })

        }

        for(const file of mediaFiles) {
            await prisma.file.update({
                where:{
                    id:file.id
                },
                data:{
                    postIds: {
                        push:draftPostId
                    }
                }
            })

        }





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
                files:true
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

postRouter.put("/movetodraft/:postid", async (req, res) => {
    try {
        //@ts-ignore
        const userId = req.userId;
        const postId = req.params.postid;

        await prisma.post.update({
            where:{
                id:postId,
                userId
            },
            data:{
                status:"DRAFT"
            }
         })

         res.status(200).json({
            message: "Post Status Updated To Draft Successfully"
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
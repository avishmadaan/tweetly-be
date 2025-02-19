// import { Router } from "express";
import authMiddleware from "../middlewares/auth-middleware";
import { prisma } from "../config";
import { Router } from "express";
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "./uploadthing";
import axios from "axios";
import { TwitterApi } from 'twitter-api-v2';

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

postRouter.get("/getpublishedpost", async (req, res) => {
    try {
        //@ts-ignore
        const userId = req.userId;

        const response = await prisma.post.findMany({
            where:{
                userId,
                status:"PUBLISHED"
            },
            include:{
                files:true
            },
            orderBy:{
                updatedAt:"desc"
            }
        })

        res.status(200).json({
            message:"Published Post Fetched Successfully",
            publishedPosts: response
        })
    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error",
            error: err,
          });
    }
})
postRouter.get("/getscheduledpost", async (req, res) => {
    try {
        //@ts-ignore
        const userId = req.userId;

        const response = await prisma.post.findMany({
            where:{
                userId,
                status:"SCHEDULED"
            },
            include:{
                files:true
            },
            orderBy:{
                updatedAt:"desc"
            }
        })

        res.status(200).json({
            message:"Scheduled Post Fetched Successfully",
            scheduledPosts: response
        })
    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error",
            error: err,
          });
    }
})

postRouter.post("/publishposttotwitter", async(req, res) => {

        //@ts-ignore
        const userId = req.userId;
        const id = req.body.id;
        const tweetText = req.body.tweetText;
        const postMedia:{
            fileURL:string,
            fileType:string
        }[] = req.body.postMedia;

        if (postMedia.length > 4) {
             res.status(400).json({
              message: "You can only upload up to 4 images per tweet.",
            });
            return;
          }

        const twitterAccount = await prisma.twitter.findUnique({
            where: { 
                id,
                userId
             },
          });

          if(!twitterAccount) {
            
            res.status(404).json({
                message:"Twitter Account Not Connected"
            })
            return;
          }

          const client = new TwitterApi({
            appKey: process.env.TWITTER_CLIENT_ID as string,
            appSecret: process.env.TWITTER_CLIENT_SECRET as string,
            accessToken:twitterAccount.accessToken,
            accessSecret:twitterAccount.refreshToken
          })

          const mediaIds:string[] = [];
          console.log("media ids")
          console.log(postMedia);

          for(const file of postMedia) {

            try {
                const response = await axios.get(file.fileURL, {responseType:"arraybuffer"});
                const buffer = Buffer.from(response.data, 'binary');
                console.log("buffer")
                console.log(buffer);
                const mediaId = await client.v2.uploadMedia(buffer, {
                    media_type:file.fileType,
                    media_category:"tweet_image"
                }) ;
                console.log(mediaId)
                mediaIds.push(mediaId);
            } catch(err) {
                console.log(err);
                res.status(501).json({
                    message:"Media Uploading Failed"
                })
                return;
            }
          }

const limitedMediaIds = mediaIds.slice(0, 4) as [string] | [string, string] | [string, string, string] | [string, string, string, string];
console.log("limitedMediaIds", limitedMediaIds);

        try {
            console.log("reached here")
            const response = await client.v2.tweet(tweetText, {
                media:{
                    media_ids:limitedMediaIds
                }
            });
            //resolve create or update post
            const respo = await prisma.post.upsert({
                where:{
                        id:postId
                },
                data:{
                    postContent:tweetText,
                    status:"PUBLISHED",
                    userId,
                    tweetId:response.data.id 
                }
            })

            res.status(201).json({
                message:"Tweet Published Successfully",
                tweetId:respo.tweetId
            })
            

        }catch(err) {
            console.log(err);
            res.status(501).json({
                message:"Tweet Posting Failed "
            })

        }
   

})


export const publishonTwitter = async () => {

    
}







export default postRouter;
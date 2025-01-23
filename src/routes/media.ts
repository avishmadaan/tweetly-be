import { Router } from "express";
import { prisma } from "../config";
import authMiddleware from "../middlewares/auth-middleware";

const mediaRouter = Router();

type FileType = {
    fileHash:string,
    name:string,
    size:number,
    type:string,
    url:string
}

mediaRouter.use(authMiddleware);

mediaRouter.post("/uploadmedia",  async (req, res) => {

    try {
         //@ts-ignore
         const userId = req.userId;
         const files:FileType[] = req.body.data;
         console.log(files);

         files.forEach(async(file) => {
            console.log("insdie uploading")
           await prisma.file.create({
                data:{
                    fileName:file.name,
                    fileType:file.type,
                    fileSize:file.size,
                    fileURL:file.url,
                    userId:userId 
                }
            })
         })

         res.status(201).json({
            message:"Media Uploaded Successfully",
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

mediaRouter.get("/getallmedia", async (req, res) => {

    try {

          //@ts-ignore
          const userId = req.userId;

          const mediaFiles = await prisma.file.findMany({
            where:{
                userId
            }
          })
          res.status(201).json({
            message:"Draft Post Create Successfully",
            files:mediaFiles
        })

    }

    catch(err){
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error",
            error: err,
          });
    }
})

mediaRouter.delete("/deletemedia/:id", async (req, res) => {

    try {
          //@ts-ignore
          const userId = req.userId;
          const id = req.params.id;

          await prisma.file.delete({
            where:{
                userId,
                id
            }
          })

          res.status(200).json({
            message:"Media Deletion Success"
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

export default mediaRouter;
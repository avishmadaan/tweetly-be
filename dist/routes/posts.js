"use strict";
// import { Router } from "express";
// import authMiddleware from "../middlewares/auth-middleware";
// import { prisma, UPLOADTHING_APP_ID, UPLOADTHING_SECRET } from "../config";
// import axios from "axios";
// import {createUploadthing} from "uploadthing/server"
// const postRouter = Router();
// postRouter.use(authMiddleware);
// const {createUploadThingAPI} = createUploadthing({
//     appId:UPLOADTHING_APP_ID,
//     secret:UPLOADTHING_SECRET
// })
// postRouter.post('/upload', async(req, res) => {
//     try {
//         const {files} = req.body;
//         if(!files) {
//             res.send(400).json({
//                 message:"No Files Provided"
//             })
//             return ;
//         }
//         if(files.length >4) {
//             res.send(400).json({
//                 message:"You can upload a maximum of 4 files"
//             })
//             return ;
//         }
//         const uploadResponse = await createUploadThingAPI({
//             files,
//             endpoint:'mediaUploader'
//         });
//         console.log(uploadResponse)
//         res.status(200).json({
//             link:uploadResponse
//         })
//     }
//     catch(err) {
//     }
// })
// export default postRouter;

import { Router } from "express";
import authMiddleware from "../middlewares/auth-middleware";
import { ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_COLLECTION, ASTRA_DB_NAMESPACE, prisma } from "../config";
import { DataAPIClient} from "@datastax/astra-db-ts"

const aiRouter = Router();

aiRouter.use(authMiddleware);

aiRouter.post("/getcontext", async(req, res) => {
    const embeddingVector:number[] = req.body.embeddingVector;
    const botId:string = req.body.botId;
    console.log("botId",botId);

    const pipeline = [
        {
          $search: {
            index: "Tweet_Search", // your Atlas Search index name
            knnBeta: {
              vector: embeddingVector,  // your query vector
              path: "embedding",
              k: 10,
            },
          },
        },
        {
          $match: {
            botId: botId,  // Filter results for the specific botId
          },
        },
        {
          $project: {
            tweet_id: 1,
            text: 1,
            likes: 1,
            retweets: 1,
            comments: 1,
            timestamp: 1,
            score: { $meta: "searchScore" },
          },
        },
      ];
    

    try {

        const result = await prisma.$runCommandRaw({
            aggregate:"bottweets",
            pipeline,
            cursor:{}
        }) as any

        const tweets = result.cursor?.firstBatch ;
     
        res.status(200).json({
            message:"Context Retrieved Successfully",
            context:tweets
        })

    }catch(err){
        console.log(err);
      res.status(500).json({
          message: "Internal Server Error",
          error: err,
        });


    }

})

aiRouter.get("/getbots", async(req, res) => {

    try {

        const bots = await prisma.bot.findMany();

        res.status(200).json({
            message:"Bots Found",
            bots
        })

    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error",
            error: err,
          });

    }
})

export default aiRouter;
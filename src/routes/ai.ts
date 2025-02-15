import { Router } from "express";
import authMiddleware from "../middlewares/auth-middleware";
import { ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_COLLECTION, ASTRA_DB_NAMESPACE, prisma } from "../config";
import { DataAPIClient} from "@datastax/astra-db-ts"

const aiRouter = Router();

aiRouter.use(authMiddleware);

aiRouter.post("/getcontext", async(req, res) => {
    const embeddingVector:number[] = req.body.embeddingVector;

    const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
    const db = client.db(ASTRA_DB_API_ENDPOINT as string, {namespace:ASTRA_DB_NAMESPACE})

    try {

        const collection = await db.collection(
            ASTRA_DB_COLLECTION as string
        );
        const cursor = await collection.find({}, {
            sort:{
                $vector: embeddingVector
            },
            limit: 10
        })

        const documents = await cursor.toArray();
        const docsMap = documents.map((doc) => doc.text);
        const docContext = JSON.stringify(docsMap);

        res.status(200).json({
            message:"Context Retrieved Successfully",
            context:docContext
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
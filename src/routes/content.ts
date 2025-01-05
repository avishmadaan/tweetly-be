import { Router } from "express";
import authMiddleware from "../middlewares/auth-middleware";
import { prisma } from "../config";
import axios from "axios";

const contentRouter = Router();

contentRouter.use(authMiddleware);

contentRouter.post("/add", async (req, res) => {
  try {
    const tweetId = req.body.tweetId;
    //@ts-ignore
    const userId = req.userId;
    const categorySelectedId = req.body.categoryId;

    const tweet = await prisma.tweet.findFirst({
      where: {
        tweetId,
        userId,
      }
    });

    if (tweet) {
      console.log("tweet", tweet);

      res.status(409).json({
        message: "Tweet Alredy Exists",
      });
      return;
    }
    const response = await axios.get(
      `https://react-tweet.vercel.app/api/tweet/${tweetId}`
    );
    const result = response.data;

    await prisma.tweet.create({
      data: {
        tweetId,
        username: result.data.user.name,
        description: result.data.text,
        userId,
        categoryId:categorySelectedId || null
      },
    });

    res.status(200).json({
      message: "Tweet Saved successfully",
    });
  } catch (err) {
    res.status(403).json({
      message: "tweet does not exist",
      error: err,
    });
  }
});

contentRouter.get("/gettweets", async (req, res) => {
  try {
    //@ts-ignore
    const userId = req.userId;

    const tweets  =  await prisma.tweet.findMany({
        where:{
            userId
        },
        orderBy :{
          createdAt:'desc'
        },
        include:{
          category:true
        }
        
    })

    res.status(200).json({
        message:"Tweets Found",
        tweets:tweets
    })
  } catch (err) {
    console.log(err);
    res.status(500).json({
        message: "Internal Server Error",
        error: err,
      });
  }
});

contentRouter.delete("/deletetweet/:id", async (req, res) => {
    try {
      //@ts-ignore
      const userId = req.userId;
      const id = req.params.id;


     await prisma.tweet.delete({
        where:{
           id,
           userId
        }
      })
  
      res.status(200).json({
          message:"Deletion Successfull"
      })
    } catch (err) {
      console.log(err);
      res.status(500).json({
          message: "Internal Server Error",
          error: err,
        });
    }
  });

contentRouter.post("/addcategory", async (req, res) => {

  try {

     //@ts-ignore
     const userId = req.userId;
     const categoryName = req.body.categoryName;

     if(!categoryName) {
      res.status(400).json({
        message: "Category Name Not Allowed"
      });
      return;


     }

     const existingCategory = await prisma.category.findFirst({
      where: {
        name: categoryName,
        userId: userId
      }
    });

    if(existingCategory) {
      res.status(409).json({
        message: "Category Alredy Exist For User"
      });

      return ;
    }

     const result = await prisma.category.create({
      data:{
        name:categoryName,
        userId
      }
     })
     console.log(result)

     res.status(201).json({
      message:"Category Created Successfully",
      categoryId:result.id
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

contentRouter.get("/getcategories", async (req, res) => {
  try {
    //@ts-ignore
    const userId = req.userId;

    const categories  =  await prisma.category.findMany({
        where:{
            userId
        }
        // ,
        // orderBy :{
        //   createdAt:'desc'
        // }
        
    })

    res.status(200).json({
        message:"Categories Found",
        categories
    })
  } catch (err) {
    console.log(err);
    res.status(500).json({
        message: "Internal Server Error",
        error: err,
      });
  }
});

contentRouter.delete("/deletecategory/:id", async (req, res) => { 

  try {
    //@ts-ignore
    const userId = req.userId;
    const categoryId = req.params.id;

    const result = await prisma.category.delete({
      where:{
        id:categoryId,
        userId:userId
      }
    })

    res.status(200).json({
      message:"Category Deletion Successfull"
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


contentRouter.put("/categoryupdate",async (req, res) => {

  try {
    //@ts-ignore
    const userId = req.userId;
    const categoryId = req.body.categoryId || null;
    const tweetIdPrimary = req.body.tweetIdPrimary;



    await prisma.tweet.update({
      where:{
        id:tweetIdPrimary,
        userId
      },
      data:{
        categoryId
      }
    })

    res.status(200).json({
        message: "Category Updated Successfully",
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

export default contentRouter;

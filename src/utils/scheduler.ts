import {prisma} from "../config";
import cron from "node-cron";
import { TwitterApi } from 'twitter-api-v2';

cron.schedule('* * * * *', async () => {
    
    const dueTweets = await prisma.post.findMany({
        where:{
            status:"SCHEDULED",
            scheduledFor:{lte: new Date()}
        }
    })

    dueTweets.map(async (tweet) => {

        const twitterAccount = await prisma.twitter.findUnique({
            where: {
                userId:tweet.userId
            }
        })

        if(!twitterAccount) {
        console.error(`Twitter account not linked for user ${tweet.userId}`);
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
            const respo = await prisma.post.create({
                data:{
                    postContent:tweet.postContent,
                    status:"PUBLISHED",
                    userId:tweet.userId,
                    tweetId:response.data.id 
                }
            })

           

        }catch(err) {
            console.log(err);
            return;

        }



    })
})
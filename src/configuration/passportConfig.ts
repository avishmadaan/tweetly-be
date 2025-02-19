
import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import {GOOGLE_CLIENT_SECRET, GOOGLE_CLIENT_ID, BASE_URL, prisma  } from "../config";
import { Strategy as TwitterStrategy, Profile as TwitterProfile} from "passport-twitter";
import { Cookie } from "express-session";


passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_CLIENT_ID as string,
            clientSecret: GOOGLE_CLIENT_SECRET as string,
            callbackURL: `${BASE_URL}/api/v1/user/google/callback`,
            

    },

    async (accessToken, refreshToken, profile:Profile, done) => {

        try {
            //This function runs first when they signup

            console.log("Inside the callback function")


            const {id, emails, displayName, photos} = profile;

            if (!emails || emails.length === 0) {
                return done(new Error("No email found in Google profile"), false);
            }

            const email = emails[0].value; // safely access the first email

            let user = await prisma.user.findFirst({
                where:{
                    googleId:id
                }
            })

            if(!user) {
                user = await prisma.user.create({
                    data:{
                        googleId:id,
                        email:email,
                        name:displayName,
                        profilePicture:photos ? photos[0].value : "",
                        authProvider:"google"
                    }
                })
            }
            done(null, user);

        }
        catch(err) {
            done(err, false);
        }
    }

)
   
)

passport.use(
    new TwitterStrategy(
      {
        consumerKey: process.env.TWITTER_CLIENT_ID as string, // Twitter API Key
        consumerSecret: process.env.TWITTER_CLIENT_SECRET as string, // Twitter API Secret Key
        callbackURL: `${process.env.BASE_URL}/api/v1/user/path/auth/twitter/callback`,
        passReqToCallback: true, // Ensures `req` is passed to the callback
      },
      async (
        req: any,
        token: string, 
        tokenSecret: string,
        profile: TwitterProfile,
        done: (error: any, user?: any) => void
      ) => {
        try {
          // Extract the user ID from the request (added by middleware)
          const userId = req.userId;
          if (!userId) {
            return done(new Error("User not logged in or no user ID found"), false);
          }
  
          // Extract profile details
          const { id: twitterId, username, displayName, photos } = profile;
  
          // Check if the Twitter account is already linked to the user
          let twitterAccount = await prisma.twitter.findFirst({
            where: { twitterId, userId },
          });
  
          if (!twitterAccount) {
            // Create a new Twitter account if it doesn't exist
            twitterAccount = await prisma.twitter.create({
              data: {
                twitterId,
                username: username || "Unknown",
                name: displayName || "Unknown",
                profilePicture: photos && photos.length > 0 ? photos[0].value : null,
                authProvider: "twitter",
                accessToken: token,
                refreshToken: tokenSecret, // OAuth 1.0a uses token secret
                userId,
              },
            });
          } else {
            // Update the existing Twitter account
            twitterAccount = await prisma.twitter.update({
              where: { id: twitterAccount.id },
              data: {
                twitterId,
                username: username || "Unknown",
                name: displayName || "Unknown",
                profilePicture: photos && photos.length > 0 ? photos[0].value : null,
                accessToken: token,
                refreshToken: tokenSecret,
              },
            });
          }
  
          // Pass the user or Twitter account to Passport
          return done(null, twitterAccount);
        } catch (err) {
          // Handle any errors during database operations
          return done(err, false);
        }
      }
    )
  );




// Serialize user, This is called Second
passport.serializeUser(
    
    (user:any, done:(err:any, id?:string) => void) => {
        done(null, user.id);
        console.log("Initialise serial")
    });

// Deserialize user
passport.deserializeUser(async (id:string, done:(err: any, user?: any) => void) => {
  try {
    console.log("Deserialization happens")
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
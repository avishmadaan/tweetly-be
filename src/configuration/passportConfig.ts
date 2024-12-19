
import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import {GOOGLE_CLIENT_SECRET, GOOGLE_CLIENT_ID, BASE_URL, prisma  } from "../config";


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
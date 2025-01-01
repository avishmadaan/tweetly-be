"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const config_1 = require("../config");
const passport_twitter_1 = require("passport-twitter");
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: config_1.GOOGLE_CLIENT_ID,
    clientSecret: config_1.GOOGLE_CLIENT_SECRET,
    callbackURL: `${config_1.BASE_URL}/api/v1/user/google/callback`,
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //This function runs first when they signup
        console.log("Inside the callback function");
        const { id, emails, displayName, photos } = profile;
        if (!emails || emails.length === 0) {
            return done(new Error("No email found in Google profile"), false);
        }
        const email = emails[0].value; // safely access the first email
        let user = yield config_1.prisma.user.findFirst({
            where: {
                googleId: id
            }
        });
        if (!user) {
            user = yield config_1.prisma.user.create({
                data: {
                    googleId: id,
                    email: email,
                    name: displayName,
                    profilePicture: photos ? photos[0].value : "",
                    authProvider: "google"
                }
            });
        }
        done(null, user);
    }
    catch (err) {
        done(err, false);
    }
})));
passport_1.default.use(new passport_twitter_1.Strategy({
    consumerKey: process.env.TWITTER_CLIENT_ID, // Twitter API Key
    consumerSecret: process.env.TWITTER_CLIENT_SECRET, // Twitter API Secret Key
    callbackURL: `${process.env.BASE_URL}/api/v1/user/path/auth/twitter/callback`,
    passReqToCallback: true, // Ensures `req` is passed to the callback
}, (req, token, tokenSecret, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract the user ID from the request (added by middleware)
        const userId = req.userId;
        if (!userId) {
            return done(new Error("User not logged in or no user ID found"), false);
        }
        // Extract profile details
        const { id: twitterId, username, displayName, photos } = profile;
        // Check if the Twitter account is already linked to the user
        let twitterAccount = yield config_1.prisma.twitter.findFirst({
            where: { twitterId, userId },
        });
        if (!twitterAccount) {
            // Create a new Twitter account if it doesn't exist
            twitterAccount = yield config_1.prisma.twitter.create({
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
        }
        else {
            // Update the existing Twitter account
            twitterAccount = yield config_1.prisma.twitter.update({
                where: { id: twitterAccount.id },
                data: {
                    accessToken: token,
                    refreshToken: tokenSecret,
                },
            });
        }
        // Pass the user or Twitter account to Passport
        return done(null, twitterAccount);
    }
    catch (err) {
        // Handle any errors during database operations
        return done(err, false);
    }
})));
// Serialize user, This is called Second
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
    console.log("Initialise serial");
});
// Deserialize user
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Deserialization happens");
        const user = yield config_1.prisma.user.findUnique({ where: { id } });
        done(null, user);
    }
    catch (err) {
        done(err, null);
    }
}));
exports.default = passport_1.default;

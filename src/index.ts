import express from "express";
import userRouter from "./routes/user";
import cors from "cors"
import { PORT } from "./config";
import cookieParser from "cookie-parser"
import session from "express-session";
import { SESSION_SECRET } from "../src/config";
import passport from "../src/configuration/passportConfig"; 

const app= express();

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
      origin: ["http://localhost:3000", "http://localhost:4000"], 
      credentials: true, 
    })
  );

app.use(session({
    secret:SESSION_SECRET as string,
    resave:false,
    saveUninitialized:true,
}))

app.use(passport.initialize());
app.use(passport.session());



app.use("/api/v1/user", userRouter);



app.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}`)

});
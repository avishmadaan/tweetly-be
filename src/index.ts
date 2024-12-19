import express from "express";
import userRouter from "./routes/user";
import cors from "cors"
import { PORT } from "./config";
import cookieParser from "cookie-parser"

const app= express();

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
      origin: "http://localhost:3000", 
      credentials: true, 
    })
  );

app.use("/api/v1/user", userRouter);


app.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}`)

});
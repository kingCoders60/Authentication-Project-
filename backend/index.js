import express from "express";
import dotenv from "dotenv";
import {connectDB} from "./db/connectDB.js"
import authRoutes from "./route/auth.route.js"
import cookieParser from "cookie-parser";
dotenv.config()

const app =express();

app.get("/",(req,res)=>{
    res.send("This is noice")
})
const PORT = process.env.PORT || 5000
app.use(express.json()) //This will help us to parse incoming json values...\
app.use(cookieParser()); //This will help to parse the incoming cookie.
app.use("/api/auth",authRoutes);

app.listen(PORT,()=>{
    connectDB();
    console.log(`Server is Connected at Port: ${PORT}`)
})
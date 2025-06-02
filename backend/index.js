import express from "express";
import dotenv from "dotenv";
import {connectDB} from "./db/connectDB.js"
import authRoutes from "./route/auth.route.js"
dotenv.config()

const app =express();

app.get("/",(req,res)=>{
    res.send("This is noice")
})

app.use("/api/auth",authRoutes)

app.listen(3000,()=>{
    connectDB();
    console.log("Server is run at port 3000")
})
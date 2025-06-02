import express from "express";

const app =express();

app.get("/",(req,res)=>{
    res.status("Hello World")
})

app.listen(3000,()=>{
    console.log("Server is run at port 3000")
})
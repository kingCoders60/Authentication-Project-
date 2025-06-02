import express from "express";

const router = express.Router();
router.get("/signup",(req,res)=>{
    res.send("Sign up Route");
})
router.get("/login",(req,res)=>{
    res.send("Log in Route");
})
router.get("/logout",(req,res)=>{
    res.send("Log out Route");
});
export default router;
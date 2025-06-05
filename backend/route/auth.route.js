import express from "express";
import {signup,logout,login,verifyEmail,forgetpassword} from "../controllers/auth.controller.js"

const router = express.Router();
router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout);
router.post("/verify-email",verifyEmail);
router.post("/forget-password",forgetpassword);
export default router;
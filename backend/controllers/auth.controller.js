import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import {sendVerificationEmail} from "../mailtrap/emails.js"
import {sendWelcomeEmail} from "../mailtrap/emails.js"
import {
  sendPasswordResetEmail,
  sendResetSuccessfullEmail,
} from "../mailtrap/emails.js";

const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required!" });
    }

    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists!" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    await user.save();

    generateTokenAndSetCookie(res, user._id);
    await sendVerificationEmail(user.email,verificationToken);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: { ...user._doc, password: undefined },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Internal Server Error",
      });
  }
};
export const verifyEmail = async(req,res)=>{
  const {code}=req.body;
  const user = await User.findOne({
      verificationToken:code,
      verificationTokenExpiresAt:{$gt:Date.now()}
  })
  if(!user){
    return res.status(400).json({message:"Invalid or expired verfication code!"});
  }
  user.isVerified=true;
  user.verificationToken=undefined;
  user.verificationTokenExpiresAt=undefined;
  await user.save();

  await sendWelcomeEmail(user.email,user.name);
  res.status(200).json({
    success:true,
    message:"Email verified successfully",
    user:{
      ...user._doc,
      message:undefined
    },
  })
}

// export const login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Email and password are required!" });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found!" });
//     }

//     const isPasswordValid = await bcryptjs.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res
//         .status(401)
//         .json({ success: false, message: "Invalid credentials!" });
//     }

//     generateTokenAndSetCookie(res, user._id);

//     res
//       .status(200)
//       .json({
//         success: true,
//         message: "Login successful!",
//         user: { ...user._doc, password: undefined },
//       });
//   } catch (error) {
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: error.message || "Internal Server Error",
//       });
//   }
// };

export const login=async(req,res)=>{
  const {email,password}=req.body;
  try {
    const user = await User.findOne({email});
    if(!user){
      return res.status(400).json({message:"Invalid Credentials!"});
    }
    const isPasswordValid=await bcryptjs.compare(password,user.password);
    if(!isPasswordValid){
      return res.status(400).json({success:false,message:"Invalid Credentials!"})
    }
    res.status(200).json({
      success:true,
      message:"Logged in Successfully!",
      user:{
        ...user._doc,
        password:undefined
      },
    });
  } catch (error) {
    console.log("Error in logging in!",error);
    return res.status(500).json({success:false,message:error.message});
  }
}
export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ success: true, message: "Logout successful!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const forgetPassword = async(req,res)=>{
    const {email} = req.body;
  try{
    const user = await User.findOne({ email });
      if(!user){
        return res.status(400).json({message:"Invalid Credentials!",success:false});
      }
      //Generate Token
      const resetToken = crypto.randomBytes(20).toString("hex");
      const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpiresAt = resetTokenExpiresAt;

      await user.save();
      await sendPasswordResetEmail(
        user.email,
        `${process.env.CLIENT_URL}/reset-password/${resetToken}`
      );

      res
        .status(200)
        .json({
          success: true,
          message: "Password reset link sent to your email",
        });

  }catch(error){
    console.log("Error in forgetpassword!!");
    return res.status(400).json({success:false,message:"Forget Password Failed!"});
  }
}

export const resetPassword = async(req,res)=>{
  try {
    const {token} = req.params;
    const {password}=req.body;

    const user = await User.findOne({
      resetPasswordToken:token,
      resetPasswordExpiresAt:{ $gt:Date.now()},
    });

    if(!user){
      return res.status(400).json({
        success:false,
        message:"Invalid or Token Expired!!"
      })
    }
      const hashedPassword=await bcryptjs.hash(password,10);
      user.password=hashedPassword,
      user.resetPasswordToken=undefined,
      user.resetPasswordExpiresAt=undefined,
      await user.save();

      await sendResetSuccessfullEmail(user.email);
      return res.status(200).json({success:true,message:"Password reset successfully!!"});
    
  } catch (error) {
    return res.status(500).json({sucess:false,message:"Error in resetting the password!"});
  }
}

export const checkAuth=async(req,res)=>{
  try {
    const user= await User.findById(req.userId);
    if(!user){
      return res.status(400).json({sucess:false,message:"User not Found!!"});
    }
    res.status(200).json({success:true,user:{
      ...user._doc,
      password:undefined
    }});
  } catch (error) {
    
  }
}
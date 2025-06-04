import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import {sendVerificationEmail} from "../mailtrap/emails.js"
import {sendWelcomeEmail} from "../mailtrap/emails.js"

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

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required!" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials!" });
    }

    generateTokenAndSetCookie(res, user._id);

    res
      .status(200)
      .json({
        success: true,
        message: "Login successful!",
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

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ success: true, message: "Logout successful!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

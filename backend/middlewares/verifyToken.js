import jwt from "jsonwebtoken";
export const verifyToken=(req,res,next)=>{
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({success:false,message:"Unauthorized! no token provided!"})
    }
    try {
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        req.userId=decoded.userId
        next();
        if(!decoded){
            return res.status(401).json({sucess:false,message:"Unauthorized -Invalid token"}); //Invalid Access token ke liye Error 401;
        }
    } catch (error) {
        console.error("Error in verifyToken",error);
        return res.status(500).json({sucess:false,message:"Error in VerifyToken!!"});
    }   
}
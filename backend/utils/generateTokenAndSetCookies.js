import jwt from "jsonwebtoken";

export const geneateTokenAndSetCookie=(req,res)=>{
        const token = jwt.sign({userId},process.env.JWT_SECRET,{
            expiresIn:"7d",
        })
        res.cookie("token",token,{
            httpOnly:true, //this prevent from xss attack
            secure:process.env.NODE_ENV==="production",
            sameSite:"strict",
            maxAge:7*24*60*100
        });

        return token;
}
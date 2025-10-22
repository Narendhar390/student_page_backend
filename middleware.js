const user=require("./Model/user")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcryptjs")
require("dotenv").config()
const isAuthenticated=async(req,res,next)=>{
    try{
        const authHeader=req.headers.authorization
        if(!authHeader||!authHeader.startsWith("Bearer")){
            return res.status(401).send({message:"No token provided"});
        }
        const token=authHeader.split(" ")[1]
        const decoded=jwt.verify(token,process.env.SECRET_KEY)
        const usr=await user.findById(decoded.id).select("-password")
        req.user=usr
        next();
    }
    catch(err){
        res.send({message:err.message})
    }
}
const isAdmin=(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
             return res.status(403).send("Access denied")
        }
        next()
    }
}
module.exports={isAuthenticated,isAdmin}
    
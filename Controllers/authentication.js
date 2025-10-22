const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")
const user=require("../Model/user")
require("dotenv").config()
const register=async(req,res)=>{
    try{
    const {username,email,password,role,}=req.body;
    if(await user.findOne({email})){
        return res.status(400).send({message:"User already exist"})
    }
    const salt=await bcrypt.genSalt(10);
    const hashpassword=await bcrypt.hash(password,salt)
    const User= new user({username,email,password:hashpassword,role})
    const savedUser=await User.save();
    const access=jwt.sign({id:savedUser._id,role:savedUser.role},process.env.SECRET_KEY,{expiresIn:"1h"})
    console.log("User created sucessfully")
    res.status(201).send({message:"user created sucessfully",accestoken:access})
} catch(err){
    console.log("error in registration",err.message)
    res.status(400).send({message:err.message});
}}
const login=async(req,res)=>{
    try{
        const{usercredential,password}=req.body
        const existingUser=await user.findOne({$or:[
            {username:usercredential},
            {email:usercredential}
        ]})
        if(!existingUser){
            return res.status(404).send({message:"No user found"})
        }
        const ismatch=await bcrypt.compare(password,existingUser.password);
        if(!ismatch){
            return res.status(404).send({message:"please check password and email"})
        }
        const access=jwt.sign({id:existingUser._id,role:existingUser.role},process.env.SECRET_KEY,{expiresIn:"1h"})
        res.status(200).send({message:"login sucessfull",accesstoken:access})
    }
    catch(err){
        console.log("error in login");
        res.status(400).send({message:err.message})
    }

}
module.exports={register,login};
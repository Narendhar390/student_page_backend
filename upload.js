const cloudinary=require("cloudinary").v2
const dotenv = require("dotenv");
const multer=require("multer")
dotenv.config()
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
})
const storage=multer.memoryStorage();
const upload=multer({storage:storage})
module.exports=upload
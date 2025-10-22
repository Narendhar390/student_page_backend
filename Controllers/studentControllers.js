const multer=require("multer")
const student=require("../Model/studentModel")
const streamifier=require("streamifier")
const cloudinary=require("cloudinary").v2
require("dotenv").config()
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
})
// const createStudent=async(req,res)=>{
//     try{
//         if(req.file){
//             console.log("entered in file uploading logic")
//             const clouduploader=cloudinary.uploader.upload_stream({folder:'students'},async(error,result)=>{
//                 if(error){
//                     console.log("Error in uploading file");
//                     res.status(400).send({message:error.message})
//                 }
//                   console.log("File uploaded sucessfully")
//                 try{
//                     const stu=new student({...req.body,
//                         image:result.secure_url,
//                         public_id:result.public_id});
//                     await stu.save()
//                     res.status(201).send({message:"user created sucessfully with image",stu})
//                 }
//                 catch(err){
//                     console.log("Dberror");
//                     res.status(400).send({message:err.message});
//                 }
//             }
//             );
//         streamifier.createReadStream(req.file.buffer).pipe(clouduploader);
//         }
//         else{
//             console.log("This is fired not this");
//         const stu=new student(req.body);
//         await stu.save();
//         res.status(201).send({message:"Student created  without image sucessfully",stu})
//         }
//     }catch(err){
//         console.log("Error in creation student");
//         console.log(err.message)
//         res.status(400).send({message:err.message})
//     }
// }
const createStudent = async (req, res) => {
    try {
        const studentData = req.body;
        let imageUrl = null;
        let publicId = null;

        if (req.file) {
            console.log("Entered file uploading logic");

            // 1. Wrap the asynchronous stream upload in a Promise
            const cloudinaryResult = await new Promise((resolve, reject) => {
                const clouduploader = cloudinary.uploader.upload_stream(
                    { folder: 'students' },
                    (error, result) => {
                        if (error) {
                            return reject(new Error("Cloudinary upload failed: " + error.message));
                        }
                        resolve(result);
                    }
                );
                // Pipe the file buffer into the Cloudinary stream
                streamifier.createReadStream(req.file.buffer).pipe(clouduploader);
            });
            
            console.log("File uploaded successfully to Cloudinary");
            imageUrl = cloudinaryResult.secure_url;
            publicId = cloudinaryResult.public_id;
        }

        // 2. Database Operation (This runs ONLY after the file upload finishes)
        const stu = new student({
            ...studentData,
            image: imageUrl,
            public_id: publicId
        });
        await stu.save();

        const message = req.file 
            ? "Student created successfully with image" 
            : "Student created without image successfully";

        res.status(201).send({ message, stu });

    } catch (err) {
        console.log("Error in creating student:", err.message);
        
        // If the error was from Cloudinary, it is caught here
        res.status(400).send({ message: err.message });
    }
};

// **NOTE:** You must ensure 'student' (your Mongoose Model) and 'streamifier' 
// are correctly required/imported in this file's scope.
const getStudents=async(req,res)=>{
    try{
        const students=await student.find();
        res.send(students);
    }
    catch(err){
        console.log("error in geting students");
        res.status(400).send({message:err.message});
    }
}
const getStudent=async(req,res)=>{
    try{
        const id=req.params.id;
        const stu=await student.findById(id)
        if(!stu){
            console.log("Student not found ");
            return res.status(404).send({message:"student not found"})
        }
        res.status(200).send(stu)
    }
    catch(err){
        console.log("error in finding student");
        res.status(400).send({message:err.message})
    }
}
const updateStudent=async(req,res)=>{
    try{
        const id=req.params.id
        const stu= await student.findById(id);
        if(!stu){
            console.log("student not found");
            return res.status(200).send({message:"Student not found"});
        }
        if(req.file){
        if(stu.public_id){
            await cloudinary.uploader.destroy(stu.public_id);
            const cloudUploader=cloudinary.uploader.upload_stream({folder:'students'},async(err,result)=>{
                if(err){
                    console.log("Error in uploading file")
                    return res.status(400).send({message:err.message})
                }
                else{
                    stu.image=result.secure_url;
                    stu.public_id=result.public_id;
                    // Object.assign(stu,req.body);
                    for (const key in req.body) {
                     if (req.body[key] !== undefined&& req.body[key] !== '') {
                            stu[key] = req.body[key];
                    }
                    try{
                        await stu.save()
                       return res.status(200).send({message:"Updation sucessfull",stu})
                    }
                    catch(err){
                        return res.status(400).send({message:err.message})
                    }
                }}
            })
            streamifier.createReadStream(req.file.buffer).pipe(cloudUploader)

        }
        }
    else{
       //Object.assign(stu,req.body)
       for (const key in req.body) {
        if (req.body[key] !== undefined&& req.body[key] !== '') {
            stu[key] = req.body[key];
        }
    }
        await stu.save();
        res.status(200).send({message:"Updation sucess full",stu});
    }
    }
    catch(err){
        console.log("Error in updating students");
        res.status(400).send({message:err.message})
    }
}
const deleteStudent=async(req,res)=>{
    try{
        
        const stu=await student.findByIdAndDelete(req.params.id)
        if(!stu){
            console.log("student not with given id");
            return res.status(404).send("Student not found");
        }
        if(stu.public_id){
            cloudinary.uploader.destroy(stu.public_id);
        }
         res.status(200).send({message:"Deletion sucessfull",stu});
    }
    catch(err){
        console.log("error",err);

        res.status(400).send({message:err.message})
    }
}
module.exports={createStudent,getStudent,getStudents,updateStudent,deleteStudent};
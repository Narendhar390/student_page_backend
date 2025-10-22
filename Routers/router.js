const express=require("express");
const upload=require("../upload")
// const upload = require('./path/to/multerConfig'); 
const {createStudent,getStudent,getStudents,updateStudent,deleteStudent}=require("../Controllers/studentControllers")
const {register,login}=require("../Controllers/authentication")
const {isAuthenticated,isAdmin}=require("../middleware")
const router=express.Router()
router.get("/",isAuthenticated,getStudents);
router.get("/:id",isAuthenticated,getStudent);
router.post("/",upload.single("image"),isAuthenticated,createStudent)
router.put("/:id",upload.single("image"),isAuthenticated,updateStudent)
router.delete("/:id",isAuthenticated,deleteStudent)
router.post("/signup",register);
router.post("/login",login);
module.exports=router
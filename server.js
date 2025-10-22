const express=require("express")
const cors=require("cors")
const app=express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: "http://localhost:3000",
    methods:"GET,POST,DELETE,PUT"
}
))
const studentrouter=require("./Routers/router")
const dotenv=require("dotenv")
dotenv.config()
const mongoose=require("mongoose")
mongoose.connect(process.env.MONGO_URI).then(()=>{console.log("Data base connection sucessfull")}).catch((err)=>{
    console.log("Error in database connection",err.message)
});
app.use("/api/students/",studentrouter);
app.get("/",(req,res)=>{
    res.send("Hello from express js server");
})
app.listen(5000,()=>{
    console.log("App start running.....")
})
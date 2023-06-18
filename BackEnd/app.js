const express = require('express');
const app = express();
const cors = require('cors');
const {generateFile} = require('./generateFle');
const {spawnSync} = require('child_process');
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const AllProblems = require("./models/AllProblems");
const path = require("path");
const fs = require('fs');
dotenv.config();
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.URL,{useNewUrlParser:true});
const con = mongoose.connection;
con.on('open',()=>{
    console.log("Database Connected...");
})

app.post("/getProblem",async(req,res)=>{
    try{
        const a = await AllProblems.findById(req.body.id);
        return res.json(a);
    }
    catch(err){
        return res.json({err});
    }
})

app.post("/runCode",async(req,res)=>{
    const {language = "cpp",code,input} = req.body;

    if(code === undefined){
        return res.status(400).json({success:false, error:"Empty code body"})
    }
    const filePath = await generateFile(language,code);
    if(language === 'cpp'){
        const start = Date.now()
        let obj = spawnSync(`g++ -o ${filePath.substr(0,filePath.length - 4)}.exe ${filePath}&${filePath.substr(0,filePath.length - 4)}.exe`,{
            input:input,encoding:'utf-8',shell:true
        });
        const end = Date.now();
        fs.unlink(filePath,(err)=>{});
        fs.unlink(`${filePath.substr(0,filePath.length-4)}.exe`,(err)=>{});
        if(obj.error){
            return res.json({"error":obj.error,"time":(end-start)/1000});
        }
        else if(obj.stderr !== ''){
            return res.json({"stderr":obj.stderr.substr(obj.stderr.indexOf(',')),"time":(end-start)/1000});
        }
        else{
            return res.json({"stdout":obj.stdout,"time":(end - start)/1000});
        }
    }
    else if(language === 'c'){
        let obj = spawnSync(`g++ -o ${filePath.substr(0,filePath.length - 2)}.exe ${filePath}&${filePath.substr(0,filePath.length - 2)}.exe`,{
            input:input,encoding:'utf-8',shell:true
        });
        fs.unlink(filePath,(err)=>{});
        fs.unlink(`${filePath.substr(0,filePath.length-2)}.exe`,(err)=>{});
        if(obj.error){
            return res.json({"error":obj.error});
        }
        else if(obj.stderr !== ''){
            return res.json({"stderr":obj.stderr.substr(obj.stderr.indexOf(','))});
        }
        else{
            return res.json({"stdout":obj.stdout});
        }
    }
    else if(language === 'py'){
        let obj = spawnSync(`python ${filePath}`,[],{input:input,encoding:'utf-8',shell:true})
        fs.unlink(filePath,(err)=>{});
        if(obj.error){
            return res.json({"error":obj.error});
        }
        else if(obj.stderr !== ''){
            return res.json({"stderr":obj.stderr.substr(obj.stderr.indexOf(','))});
        }
        else{
            return res.json({"stdout":obj.stdout});
        }
    }
});

app.get("/AllProblems",async(req,res)=>{
   try{
        const a = await AllProblems.find();
        return res.json(a);
   }
   catch(err){
        return res.status(400).json({err});
   } 
})

app.post("/createNewProblem",async(req,res)=>{
    try{
        const obj = req.body;
        let db = new AllProblems(obj);
        await db.save();
        return res.json(db);
    }
    catch(err){
        console.log(`Error while creating new Problem ${err}`);
        return res.status(400).json({error:err});
    }
})

app.listen(5000,()=>{
    console.log("listening on http://localhost:5000");
})
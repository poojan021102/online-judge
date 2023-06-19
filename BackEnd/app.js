const express = require('express');
const app = express();
const cors = require('cors');
const {generateFile} = require('./generateFle');
const {spawnSync} = require('child_process');
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const AllProblems = require("./models/AllProblems");
const path = require("path");
const fileUpload = require("express-fileupload");
const fs = require('fs');
const AllTestCases = require("./models/AllTestCases")
const AllVirdicts = require("./models/AllVerdicts");
dotenv.config();
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors());
app.use(fileUpload());

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

app.post("/enterTestCases",async(req,res)=>{
    try{
        let fileName= req.files.testCases.name;
        let uploadPath = path.join(__dirname,"uploads");
        if(!fs.existsSync(uploadPath)){
            fs.mkdirSync(uploadPath,{recursive:true});
        }
        fileName = (Date.now()) + fileName;
        const file = req.files.testCases;
        uploadPath = path.join(uploadPath,fileName);
        await file.mv(uploadPath)
        let obj = JSON.parse(fs.readFileSync(uploadPath,'utf-8'));
        for(let i = 0;i<obj.length;++i){
            const n = new AllTestCases({problemId:req.body.problemId,input:obj[i].input,output:obj[i].output});
            await n.save();
        }
        fs.unlink(uploadPath,(err)=>{});
        return res.json({success:true});
    }
    catch(err){
        return res.json({success:false});
    }
})

app.post("/getStatus",async(req,res)=>{
    try{
        const r = await AllVirdicts.findById(req.body.verdictId);
        return res.json(r);
    }
    catch(err){
        return res.json({success:false});
    }
})

app.post("/mySubmissionForTheProblem",async(req,res)=>{
    try{
        const allProblem = await AllVirdicts.find({
            userId:req.body.userId,
            problemId:req.body.problemId
        })
        return res.status(200).json(allProblem);
    }
    catch(err){
        return res.status(400).json(err);
    }
})

app.post("/myAllSubmission",async(req,res)=>{
    try{
        const allProblem = await AllVirdicts.find({
            userId:req.body.userId
        })
        return res.status(200).json(allProblem);
    }
    catch(err){
        return res.status(400).json(err);
    }
})

app.post("/submitProblem",async(req,res)=>{
    try{
        const filePath = await generateFile(req.body.language,req.body.code);
        let verdict = new AllVirdicts({
            problemId:new mongoose.Types.ObjectId(req.body.problemId),
            executionTime:0,
            userId:new mongoose.Types.ObjectId(req.body.userId),
            status:"Pending",
            filePath:filePath,
            language:req.body.language
        });
        verdict.save();
        res.json(verdict);
        const testCases = await AllTestCases.find({problemId:req.body.problemId});
        for(let i = 0;i<testCases.length;++i){
            



            if(req.body.language === 'cpp'){
                const start = Date.now()
                let obj = spawnSync(`g++ -o ${filePath.substr(0,filePath.length - 4)}.exe ${filePath}&${filePath.substr(0,filePath.length - 4)}.exe`,{
                    input:testCases[i].input,encoding:'utf-8',shell:true
                });
                const end = Date.now();
                if(obj.error){
                    verdict.status = "success";
                    verdict.comment = "Compilation Error"
                    verdict.save();
                    return;
                }
                else if(obj.stderr !== ''){
                    verdict.status = "success";
                    verdict.comment = "Compilation Error"
                    verdict.save();
                    return;
                }
                else{
                    if(obj.stdout !== testCases[i].output){
                        verdict.status = "success";
                        verdict.comment = `Wrong Answer on test case ${i + 1}`;
                        verdict.save();
                        return;
                    }
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



        }
        verdict.status = "Correct Answer";
        verdict.comment = "Correct Answer on all test cases";
        verdict.save();
    }
    catch(err){
        return res.json({success:false});
    }
})

app.post("/allSubmission",async(req,res)=>{
    try{
        const u = await AllVirdicts.find({problemId:new mongoose.Types.ObjectId(req.body.problemId)});
        return res.status(200).json(u);
    }
    catch(err){
        return res.json(err)
    }
})

app.post("/downloadFile",async(req,res)=>{
    return res.download(req.body.filePath);
})

app.post("/createNewProblem",async(req,res)=>{
    try{
        const obj = req.body;
        let db = new AllProblems({title:obj.title,description:obj.description,sampleInput:obj.sampleInput,sampleOutput:obj.sampleOutput,constraints:obj.constraints,createdBy:obj.createdBy});
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
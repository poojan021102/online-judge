const express = require("express");
const app = express();
const cors = require("cors");
const { generateFile } = require("./generateFle");
const { spawnSync } = require("child_process");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const AllProblems = require("./models/AllProblems");
const path = require("path");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const User = require("./models/User");
const AllTestCases = require("./models/AllTestCases");
const AllVirdicts = require("./models/AllVerdicts");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Docker = require("dockerode");
const docker = new Docker();
const allCodeVeridct = require("./models/allCodeVerdict");
dotenv.config();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(fileUpload());

mongoose.connect(process.env.URL, { useNewUrlParser: true });
const con = mongoose.connection;

con.on("open", () => {
  console.log("Database Connected...");
});

app.post("/getProblem", async (req, res) => {
  try {
    const a = await AllProblems.findById(req.body.id);
    return res.json(a);
  } catch (err) {
    return res.json({ err });
  }
});

app.post("/getRunStatus",async(req,res)=>{
  const a = await allCodeVeridct.findById(req.body.id);
  if(a.status){
    await allCodeVeridct.findByIdAndDelete(req.body.id);
    return res.json(a);
  }
  else{
    return res.json(a);
  }
})

app.post("/runCode",async(req,res)=>{
  try{  
    const {language = "cpp",code,input } = req.body;
    if(code === undefined){
      return res.status(400).json({success:false,error:"Empty code body"});
    }
    const filePath = await generateFile(language,code);
    let base = path.basename(filePath);
    // add into the database
    const codeVerdict = await allCodeVeridct.create({
      status:false
    });
    let upper = path.join(__dirname,"AllCodes");
    if(language === "cpp"){
      base = base.substr(0,base.length - 4);
      let p_input = path.join(upper,`${base}_input.txt`);
      fs.writeFileSync(p_input,input);
      let p_sh = path.join(upper,`${base}_sh.sh`);
      fs.writeFileSync(p_sh,`#!/bin/bash\n./${base}.exe < ${base}_input.txt > ${base}_output.txt`);
      let p_output = path.join(upper,`${base}_output.txt`);
      let id = codeVerdict._id;

      var auxContainer;
      docker.createContainer({
      Image: 'gcc',AttachStdin: false,AttachStdout: true,AttachStderr: true,Tty: true,Cmd: ['/bin/bash'],OpenStdin: false,StdinOnce: false
      }).then(function(container) {
      auxContainer = container;
      return auxContainer.start();
      }).then(async(data)=>{
          let obj = spawnSync(`docker cp ${filePath}  ${auxContainer.id}:/${base}.cpp`,{encoding:"utf-8",shell:true});
          // console.log(obj);
          if(obj.stderr.length){
            await allCodeVeridct.findByIdAndUpdate(id,{
              status:true,
              message:"Internal Server Error"
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});fs.unlink(filePath,err=>{});
            return;
          }
          obj = spawnSync(`docker cp ${p_input}  ${auxContainer.id}:/${base}_input.txt`,{encoding:"utf-8",shell:true});
          if(obj.stderr.length){
            await allCodeVeridct.findByIdAndUpdate(id,{
              status:true,
              message:"Internal Server Error"
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});fs.unlink(filePath,err=>{});
            return;
          }
          // console.log(obj);
          obj = spawnSync(`docker exec ${auxContainer.id} g++ ${base}.cpp -o ${base}.exe`,{encoding:"utf-8",shell:true});
          // console.log(obj);
          if(obj.stderr.length){
            await allCodeVeridct.findByIdAndUpdate(id,{
              status:true,
              message:obj.stderr
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});fs.unlink(filePath,err=>{});
            return;
          }
          // console.log(obj);
          obj = spawnSync(`docker cp ${p_sh} ${auxContainer.id}:/${base}_sh.sh`,{encoding:"utf-8",shell:true});
          if(obj.stderr.length){
            await allCodeVeridct.findByIdAndUpdate(id,{
              status:true,
              message:"Internal Server Error"
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});fs.unlink(filePath,err=>{});
            return;
          }
          obj = spawnSync(`docker exec ${auxContainer.id} //bin//sh ./${base}_sh.sh`,{encoding:"utf-8",shell:true});
          // console.log(obj);
          if(obj.stderr.length){
            await allCodeVeridct.findByIdAndUpdate(id,{
              status:true,
              message:obj.stderr
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});fs.unlink(filePath,err=>{});
            return;
          }
          // console.log(obj);
          // obj = spawnSync(`docker exec ${auxContainer.id} ls`,{encoding:"utf-8",shell:true});
          // console.log(obj.stdout);
          obj = spawnSync(`docker cp ${auxContainer.id}:/${base}_output.txt ${p_output}`,{encoding:"utf-8",shell:true})
          // console.log(obj)
          if(obj.stderr.length){
            await allCodeVeridct.findByIdAndUpdate(id,{
              status:true,
              message:"Internal Server Error"
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});fs.unlink(filePath,err=>{});
            return;
          }
          const d1 = fs.readFileSync(p_output,{
            encoding:'utf-8',flag:"r"
          });
          await allCodeVeridct.findByIdAndUpdate(id,{
            status:true,
            message:d1
          });

          fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});fs.unlink(filePath,err=>{});
          // console.log(obj)
      }).then(function(data) {
        return auxContainer.stop();
      }).then(function(data) {
        return auxContainer.remove();
      }).then(function(data) {
      }).catch(async(err)=>{
        await allCodeVeridct.findByIdAndUpdate(id,{
          status:true,
          message:"Internal Server Error"
        });
        console.log(err);
      });


      
    }
    else if(language === "py"){
      base = base.substr(0,base.length-3);
      let p_input = path.join(upper,`${base}_input.txt`);
      fs.writeFileSync(p_input,input);
      let p_sh = path.join(upper,`${base}_sh.sh`);
      fs.writeFileSync(p_sh,`#!/bin/bash\npython ${base}.py < ${base}_input.txt > ${base}_output.txt`);
      let p_output = path.join(upper,`${base}_output.txt`);
      let id = codeVerdict._id;

      var auxContainer;
      docker.createContainer({
      Image: 'python',AttachStdin: false,AttachStdout: true,AttachStderr: true,Tty: true,Cmd: ['/bin/bash'],OpenStdin: false,StdinOnce: false
      }).then(function(container) {
      auxContainer = container;
      return auxContainer.start();
      }).then(async(data)=>{
          let obj = spawnSync(`docker cp ${filePath}  ${auxContainer.id}:/${base}.py`,{encoding:"utf-8",shell:true});
          // console.log(obj);
          if(obj.stderr.length){
            await allCodeVeridct.findByIdAndUpdate(id,{
              status:true,
              message:"Internal Server Error"
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});fs.unlink(filePath,err=>{});
            return;
          }
          obj = spawnSync(`docker cp ${p_input}  ${auxContainer.id}:/${base}_input.txt`,{encoding:"utf-8",shell:true});
          if(obj.stderr.length){
            await allCodeVeridct.findByIdAndUpdate(id,{
              status:true,
              message:"Internal Server Error"
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});fs.unlink(filePath,err=>{});
            return;
          }
          // console.log(obj);
          obj = spawnSync(`docker cp ${p_sh} ${auxContainer.id}:/${base}_sh.sh`,{encoding:"utf-8",shell:true});
          // console.log(obj);
          if(obj.stderr.length){
            await allCodeVeridct.findByIdAndUpdate(id,{
              status:true,
              message:"Internal Server Error"
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});fs.unlink(filePath,err=>{});
              return;
          }
          obj = spawnSync(`docker exec ${auxContainer.id} //bin//sh ./${base}_sh.sh`,{encoding:"utf-8",shell:true});
          // console.log(obj);
          if(obj.stderr.length){
            await allCodeVeridct.findByIdAndUpdate(id,{
              status:true,
              message:obj.stderr
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});fs.unlink(filePath,err=>{});
            return;
          }
          // console.log(obj);
          // obj = spawnSync(`docker exec ${auxContainer.id} ls`,{encoding:"utf-8",shell:true});
          // console.log(obj.stdout);
          obj = spawnSync(`docker cp ${auxContainer.id}:/${base}_output.txt ${p_output}`,{encoding:"utf-8",shell:true})
          // console.log(obj)
          if(obj.stderr.length){
            await allCodeVeridct.findByIdAndUpdate(id,{
              status:true,
              message:"Internal Server Error"
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});fs.unlink(filePath,err=>{});
            return;
          }
          const d1 = fs.readFileSync(p_output,{
            encoding:'utf-8',flag:"r"
          });
          await allCodeVeridct.findByIdAndUpdate(id,{
            status:true,
            message:d1
          });

          fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});fs.unlink(filePath,err=>{});
          // console.log(obj)
      }).then(function(data) {
        return auxContainer.stop();
      }).then(function(data) {
        return auxContainer.remove();
      }).then(function(data) {
      }).catch(async(err)=>{
        await allCodeVeridct.findByIdAndUpdate(id,{
          status:true,
          message:"Internal Server Error"
        });
        console.log(err);
      });



    }
    else if(language === "c"){
      base = base.substr(0,base.length - 2);
      let p_input = path.join(upper,`${base}_input.txt`);
      fs.writeFileSync(p_input,input);
      let p_sh = path.join(upper,`${base}_sh.sh`);
      fs.writeFileSync(p_sh,`#!/bin/bash\n./${base}.exe < ${base}_input.txt > ${base}_output.txt`);
      let p_output = path.join(upper,`${base}_output.txt`);
      let id = codeVerdict._id;

      var auxContainer;
      docker.createContainer({Image: 'gcc',AttachStdin: false,AttachStdout: true,AttachStderr: true,Tty: true,Cmd: ['/bin/bash'],OpenStdin: false,StdinOnce: false
      }).then(function(container) {
      auxContainer = container;
      return auxContainer.start();
      }).then(async(data)=>{
          let obj = spawnSync(`docker cp ${filePath}  ${auxContainer.id}:/${base}.c`,{encoding:"utf-8",shell:true});
          // console.log(obj);
          if(obj.stderr.length){
            await allCodeVeridct.findByIdAndUpdate(id,{
              status:true,
              message:"Internal Server Error"
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});fs.unlink(filePath,err=>{});
            return;
          }
          obj = spawnSync(`docker cp ${p_input}  ${auxContainer.id}:/${base}_input.txt`,{encoding:"utf-8",shell:true});
          if(obj.stderr.length){
            await allCodeVeridct.findByIdAndUpdate(id,{
              status:true,
              message:"Internal Server Error"
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});fs.unlink(filePath,err=>{});
            return;
          }
          // console.log(obj);
          obj = spawnSync(`docker exec ${auxContainer.id} g++ ${base}.c -o ${base}.exe`,{encoding:"utf-8",shell:true});
          // console.log(obj);
          if(obj.stderr.length){
            await allCodeVeridct.findByIdAndUpdate(id,{
              status:true,
              message:obj.stderr
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});fs.unlink(filePath,err=>{});
            return;
          }
          // console.log(obj);
          obj = spawnSync(`docker cp ${p_sh} ${auxContainer.id}:/${base}_sh.sh`,{encoding:"utf-8",shell:true});
          if(obj.stderr.length){
            await allCodeVeridct.findByIdAndUpdate(id,{
              status:true,
              message:"Internal Server Error"
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});fs.unlink(filePath,err=>{});
            return;
          }
          obj = spawnSync(`docker exec ${auxContainer.id} //bin//sh ./${base}_sh.sh`,{encoding:"utf-8",shell:true});
          // console.log(obj);
          if(obj.stderr.length){
            await allCodeVeridct.findByIdAndUpdate(id,{
              status:true,
              message:obj.stderr
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});fs.unlink(filePath,err=>{});
            return;
          }
          // console.log(obj);
          // obj = spawnSync(`docker exec ${auxContainer.id} ls`,{encoding:"utf-8",shell:true});
          // console.log(obj.stdout);
          obj = spawnSync(`docker cp ${auxContainer.id}:/${base}_output.txt ${p_output}`,{encoding:"utf-8",shell:true})
          // console.log(obj)
          if(obj.stderr.length){
            await allCodeVeridct.findByIdAndUpdate(id,{
              status:true,
              message:"Internal Server Error"
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});fs.unlink(filePath,err=>{});
            return;
          }
          const d1 = fs.readFileSync(p_output,{
            encoding:'utf-8',flag:"r"
          });
          await allCodeVeridct.findByIdAndUpdate(id,{
            status:true,
            message:d1
          });

          fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});fs.unlink(filePath,err=>{});
          // console.log(obj)
      }).then(function(data) {
        return auxContainer.stop();
      }).then(function(data) {
        return auxContainer.remove();
      }).then(function(data) {
      }).catch(async(err)=>{
        await allCodeVeridct.findByIdAndUpdate(id,{
          status:true,
          message:"Internal Server Error"
        });
        console.log(err);
      });


    }
    return res.json(codeVerdict);
}
catch(err){
  return res.json({status:false});
}
})

// app.post("/runCode", async (req, res) => {
//   const { language = "cpp", code, input } = req.body;

//   if (code === undefined) {
//     return res.status(400).json({ success: false, error: "Empty code body" });
//   }
//   const filePath = await generateFile(language, code);
//   if (language === "cpp") {
//     const start = Date.now();
//     // let obj = spawnSync(
//     //   `g++ -o ${filePath.substr(
//     //     0,
//     //     filePath.length - 4
//     //   )}.exe ${filePath}&${filePath.substr(0, filePath.length - 4)}.exe`,
//     //   {
//     //     input: input,
//     //     encoding: "utf-8",
//     //     shell: true,
//     //   }
//     // );


//     // let obj = spawnSync(
//     //   `winpty docker run -it --rm -v "$PWD":/usr/src/myapp -w /usr/src/myapp gcc:4.9 sh  -c "gcc -o ${filePath.substr(
//     //     0,
//     //     filePath.length - 4
//     //   )} ${filePath} && ./${filePath.substr(
//     //     0,
//     //     filePath.length - 4
//     //   )}"`,
//     //   {
//     //     input: input,
//     //     encoding: "utf-8",
//     //     shell: true,
//     //   }
//     // );
//     // console.log("Here")
//     // let obj = spawnSync(
//     //   `docker run -it --rm "$PWD":/usr/src/myapp -w /usr/src/myapp gcc:4.9 sh  -c "gcc -o ${filePath.substr(
//     //         0,
//     //         filePath.length - 4
//     //       )} ${filePath} && ./${filePath.substr(
//     //         0,
//     //         filePath.length - 4
//     //       )}"`,
//     //   {
//     //     input: input,
//     //     encoding: "utf-8",
//     //     shell: true,
//     //   }
//     // );
//     // console.log(obj)


//     // const containerString = "fb1c3e171a1e4ee8c4f29bbc1cafd38492643f8e6e578a89afe5f033f83065cb";
//     // const baseName = path.basename(filePath);
//     // const obj = spawnSync(`docker cp ${filePath} ${containerString}:/${baseName}`,{
//     //       input: input,
//     //       encoding: "utf-8",
//     //       shell: true,
//     //     });
//     // console.log(obj);

//     const base = path.basename(filePath);
//     const obj = spawnSync(`docker cp ${filePath} 5848ed6c3b1fec699497c9bb31996a1cebbf4cb5a628422624de6652f8ec5bd9:/${base}`,{
//       encoding:"utf-8",shell:true
//     });
//     console.log(obj);




//     const end = Date.now();
//     // fs.unlink(filePath, (err) => {});
//     // fs.unlink(`${filePath.substr(0, filePath.length - 4)}.exe`, (err) => {});
//     // if (obj.error) {
//     //   return res.json({ error: obj.error, time: (end - start) / 1000 });
//     // } else if (obj.stderr !== "") {
//     //   return res.json({
//     //     stderr: obj.stderr.substr(obj.stderr.indexOf(",")),
//     //     time: (end - start) / 1000,
//     //   });
//     // } else {
//     //   return res.json({ stdout: obj.stdout, time: (end - start) / 1000 });
//     // }
//   } else if (language === "c") {
//     let obj = spawnSync(
//       `g++ -o ${filePath.substr(
//         0,
//         filePath.length - 2
//       )}.exe ${filePath}&${filePath.substr(0, filePath.length - 2)}.exe`,
//       {
//         input: input,
//         encoding: "utf-8",
//         shell: true,
//       }
//     );
    
//     fs.unlink(filePath, (err) => {});
//     fs.unlink(`${filePath.substr(0, filePath.length - 2)}.exe`, (err) => {});
//     if (obj.error) {
//       return res.json({ error: obj.error });
//     } else if (obj.stderr !== "") {
//       return res.json({ stderr: obj.stderr.substr(obj.stderr.indexOf(",")) });
//     } else {
//       return res.json({ stdout: obj.stdout });
//     }
//   } else if (language === "py") {
//     let obj = spawnSync(`python ${filePath}`, [], {
//       input: input,
//       encoding: "utf-8",
//       shell: true,
//     });
//     fs.unlink(filePath, (err) => {});
//     if (obj.error) {
//       return res.json({ error: obj.error });
//     } else if (obj.stderr !== "") {
//       return res.json({ stderr: obj.stderr.substr(obj.stderr.indexOf(",")) });
//     } else {
//       return res.json({ stdout: obj.stdout });
//     }
//   }
// });

app.get("/AllProblems", async (req, res) => {
  try {
    const a = await AllProblems.find();
    return res.json(a);
  } catch (err) {
    return res.status(400).json({ err });
  }
});

app.post("/enterTestCases", async (req, res) => {
  try {
    let fileName = req.files.testCases.name;
    let uploadPath = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    fileName = Date.now() + fileName;
    const file = req.files.testCases;
    uploadPath = path.join(uploadPath, fileName);
    await file.mv(uploadPath);
    let obj = JSON.parse(fs.readFileSync(uploadPath, "utf-8"));
    const n = new AllTestCases({
      problemId: new mongoose.Types.ObjectId(req.body.problemId),
      testCases: obj,
    });
    n.save();
    fs.unlink(uploadPath, (err) => {});
    return res.json({ success: true });
  } catch (err) {
    return res.json({ success: false });
  }
});

app.post("/getStatus", async (req, res) => {
  try {
    const r = await AllVirdicts.findById(req.body.verdictId);
    return res.json(r);
  } catch (err) {
    return res.json({ success: false });
  }
});

app.post("/mySubmissionForTheProblem", async (req, res) => {
  try {
    const allProblem = await AllVirdicts.find({
      userId: new mongoose.Types.ObjectId(req.body.userId),
      problemId: new mongoose.Types.ObjectId(req.body.problemId),
    });
    return res.status(200).json(allProblem);
  } catch (err) {
    return res.status(400).json(err);
  }
});

app.post("/myAllSubmission", async (req, res) => {
  try {
    const allProblem = await AllVirdicts.find({
      userId: new mongoose.Types.ObjectId(req.body.userId),
    });
    return res.status(200).json(allProblem);
  } catch (err) {
    return res.status(400).json(err);
  }
});

app.post("/register", async (req, res) => {
  try {
    const all = await User.find({ userName: req.body.userName });
    if (all.length) {
      return res.json({ success: false, message: "User Name Already Exists" });
    }
    const u = new User(req.body);
    u.save();
    return res.json({ success: true });
  } catch (err) {
    return res.json({ success: false, message: "Internal Server Error" });
  }
});

app.post("/getUser", async (req, res) => {
  try {
    const user = jwt.verify(req.body.token, process.env.JWT_TOKEN_SECRET);
    // console.log(user);
    if (!user.id) {
      return res.json({ success: false });
    }
    const u = await User.findById(user.id);
    return res.json({
      success: true,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      userName: u.userName,
      id: user.id,
    });
  } catch (err) {
    res.json({ success: false, message: "Internal Server Error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const u = await User.find({ userName: req.body.userName });
    if (u.length === 0) {
      return res.json({ success: false, message: "Invalid user name" });
    }
    const passwordMatch = await bcrypt.compare(
      req.body.password,
      u[0].password
    );
    if (!passwordMatch) {
      return res.json({ success: false, message: "Invalid Password" });
    }
    const token = jwt.sign(
      {
        id: u[0]._id,
      },
      process.env.JWT_TOKEN_SECRET,
      {
        expiresIn: 4 * 24 * 60 * 60,
      }
    );
    return res.json({ success: true, token });
  } catch (err) {
    res.json({ success: false, message: "Internal Server Error" });
  }
});

app.post("/submitProblem",async(req,res)=>{
  try{



    const filePath = await generateFile(req.body.language, req.body.code);
    let verdict = await AllVirdicts.create({problemId: new mongoose.Types.ObjectId(req.body.problemId),executionTime: 0,userId: new mongoose.Types.ObjectId(req.body.userId),
      status: "pending",
      filePath: filePath,
      comment: "Pending",
      language: req.body.language,
      userName: req.body.userName,
    });
    id = verdict._id.toString();
    let problem = await AllProblems.findById(req.body.problemId);
    let wrongSubmission = problem.wrongSubmission;
    let correctSubmission = problem.correctSubmission;

    let testCases = await AllTestCases.find({
      problemId: new mongoose.Types.ObjectId(req.body.problemId),
    });
    testCases = testCases[0].testCases;
    let base = path.basename(filePath);



    let upper = path.join(__dirname,"AllCodes");
    if(req.body.language === "cpp"){
      base = base.substr(0,base.length - 4);
      let p_input = path.join(upper,`${base}_input.txt`);
      
      let p_sh = path.join(upper,`${base}_sh.sh`);
      fs.writeFileSync(p_sh,`#!/bin/bash\n./${base}.exe < ${base}_input.txt > ${base}_output.txt`);
      let p_output = path.join(upper,`${base}_output.txt`);
      let testCases = await AllTestCases.find({
        problemId: new mongoose.Types.ObjectId(req.body.problemId),
      });
      testCases = testCases[0].testCases;




      var auxContainer;
      docker.createContainer({
      Image: 'gcc',AttachStdin: false,AttachStdout: true,AttachStderr: true,Tty: true,Cmd: ['/bin/bash'],OpenStdin: false,StdinOnce: false
      }).then(function(container) {
      auxContainer = container;
      return auxContainer.start();
      }).then(async(data)=>{
        for(let i = 0;i<testCases.length;++i){
          fs.writeFileSync(p_input,testCases[i].input);
          let obj = spawnSync(`docker cp ${filePath}  ${auxContainer.id}:/${base}.cpp`,{encoding:"utf-8",shell:true});
          // console.log(obj);
          if(obj.stderr.length){
            await AllVirdicts.findByIdAndUpdate(id,{
              status:"error",
              comment:"Internal Server Error"
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});
            return;
          }
          obj = spawnSync(`docker cp ${p_input}  ${auxContainer.id}:/${base}_input.txt`,{encoding:"utf-8",shell:true});
          if(obj.stderr.length){
            await AllVirdicts.findByIdAndUpdate(id,{
              status:"error",
              comment:"Internal Server Error"
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});
            return;
          }
          // console.log(obj);
          obj = spawnSync(`docker exec ${auxContainer.id} g++ ${base}.cpp -o ${base}.exe`,{encoding:"utf-8",shell:true});
          // console.log(obj);
          if(obj.stderr.length){
            await AllVirdicts.findByIdAndUpdate(id,{
              status:"error",
              comment:obj.stderr
            })
            await AllProblems.findByIdAndUpdate(req.body.problemId,{
              wrongSubmission:wrongSubmission + 1
            });
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});
            return;
          }
          // console.log(obj);
          obj = spawnSync(`docker cp ${p_sh} ${auxContainer.id}:/${base}_sh.sh`,{encoding:"utf-8",shell:true});
          if(obj.stderr.length){
            await AllVirdicts.findByIdAndUpdate(id,{
              status:"error",
              comment:"Internal Server Error"
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});
            return;
          }
          obj = spawnSync(`docker exec ${auxContainer.id} //bin//sh ./${base}_sh.sh`,{encoding:"utf-8",shell:true});
          // console.log(obj);
          if(obj.stderr.length){
            await AllVirdicts.findByIdAndUpdate(id,{
              status:"error",
              comment:obj.stderr
            })
            await AllProblems.findByIdAndUpdate(req.body.problemId,{
              wrongSubmission:wrongSubmission + 1
            });
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});
            return;
          }
          // console.log(obj);
          // obj = spawnSync(`docker exec ${auxContainer.id} ls`,{encoding:"utf-8",shell:true});
          // console.log(obj.stdout);
          obj = spawnSync(`docker cp ${auxContainer.id}:/${base}_output.txt ${p_output}`,{encoding:"utf-8",shell:true})
          // console.log(obj)
          if(obj.stderr.length){
            await AllVirdicts.findByIdAndUpdate(id,{
              status:"error",
              comment:"Internal Server Error"
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});
            return;
          }
          const d1 = fs.readFileSync(p_output,{
            encoding:'utf8',flag:"r"
          });
          // console.log(d1);
          // console.log(testCases[i].output);
          if(d1 === testCases[i].output){
            continue;
          }
          else{
            await AllVirdicts.findByIdAndUpdate(id,{
              status:"error",
              comment:`Wrong Answer on test case ${i + 1}`
            });
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});
            return;
          }
          // console.log(obj)
      }
      await AllVirdicts.findByIdAndUpdate(id,{
        status:"success",
        comment:"Correct Answer on all test cases"
      });
      await AllProblems.findByIdAndUpdate(req.body.problemId,{
        correctSubmission:correctSubmission + 1
      });
      fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});
    }).then(function(data) {
        return auxContainer.stop();
      }).then(function(data) {
        return auxContainer.remove();
      }).then(function(data) {
      }).catch(async(err)=>{
        await AllVirdicts.findByIdAndUpdate(id,{
          status:"error",
          comment:"Internal Server Error"
        });
        console.log(err);
      });
    }      
    else if(req.body.language === "py"){
      base = base.substr(0,base.length-3);
      let p_input = path.join(upper,`${base}_input.txt`);
      let p_sh = path.join(upper,`${base}_sh.sh`);
      fs.writeFileSync(p_sh,`#!/bin/bash\npython ${base}.py < ${base}_input.txt > ${base}_output.txt`);
      let p_output = path.join(upper,`${base}_output.txt`);

      var auxContainer;
      docker.createContainer({
      Image: 'python',AttachStdin: false,AttachStdout: true,AttachStderr: true,Tty: true,Cmd: ['/bin/bash'],OpenStdin: false,StdinOnce: false
      }).then(function(container) {
      auxContainer = container;
      return auxContainer.start();
      }).then(async(data)=>{

        for(let i = 0;i<testCases.length;++i){
          fs.writeFileSync(p_input,testCases[i].input);
          let obj = spawnSync(`docker cp ${filePath}  ${auxContainer.id}:/${base}.py`,{encoding:"utf-8",shell:true});
          // console.log(obj);
          if(obj.stderr.length){
            await AllVirdicts.findByIdAndUpdate(id,{
              status:"error",
              comment:"Internal Server Error"
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});
            return;
          }
          obj = spawnSync(`docker cp ${p_input}  ${auxContainer.id}:/${base}_input.txt`,{encoding:"utf-8",shell:true});
          if(obj.stderr.length){
            await AllVirdicts.findByIdAndUpdate(id,{
              status:"error",
              comment:"Internal Server Error"
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});
            return;
          }
          // console.log(obj);
          obj = spawnSync(`docker cp ${p_sh} ${auxContainer.id}:/${base}_sh.sh`,{encoding:"utf-8",shell:true});
          console.log(obj);
          if(obj.stderr.length){
            await AllVirdicts.findByIdAndUpdate(id,{
              status:"error",
              comment:"Internal Server Error"
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});
            return;
          }
          obj = spawnSync(`docker exec ${auxContainer.id} //bin//sh ./${base}_sh.sh`,{encoding:"utf-8",shell:true});
          // console.log(obj);
          if(obj.stderr.length){
            await AllVirdicts.findByIdAndUpdate(id,{
              status:"error",
              message:obj.stderr
            })
            await  AllProblems.findByIdAndUpdate(id,{
              wrongSubmission:wrongSubmission + 1
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});
            return;
          }
          // obj = spawnSync(`docker exec ${auxContainer.id} ls`,{encoding:"utf-8",shell:true});
          // console.log(obj.stdout);
          obj = spawnSync(`docker cp ${auxContainer.id}:/${base}_output.txt ${p_output}`,{encoding:"utf-8",shell:true})
          // console.log(obj)
          if(obj.stderr.length){
            await AllVirdicts.findByIdAndUpdate(id,{
              status:"error",
              message:"Internal Server Error"
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});
            return;
          }
          const d1 = fs.readFileSync(p_output,{
            encoding:'utf-8',flag:"r"
          });
          if(d1 === testCases[i].output)continue;
          else{
            await AllVirdicts.findByIdAndUpdate(id,{
              status:"error",
              comment:`Wrong Answer on test case ${i + 1}`
            });
            await AllProblems.findByIdAndUpdate(req.body.problemId,{
              wrongSubmission:wrongSubmission + 1
            });
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});
            return;
          }

          // console.log(obj)
        }
        await AllVirdicts.findByIdAndUpdate(id,{
          status:"success",
          comment:"Correct Answer on all test cases"
        });
        await AllProblems.findByIdAndUpdate(req.body.problemId,{
          correctSubmission:correctSubmission+1
        });
        fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});
    }
    ).then(function(data) {
        return auxContainer.stop();
      }).then(function(data) {
        return auxContainer.remove();
      }).then(function(data) {
      }).catch(async(err)=>{
        await AllVirdicts.findByIdAndUpdate(id,{
          status:"error",
          comment:"Internal Server Error"
        });
        console.log(err);
      });



    }
    else if(req.body.language === "c"){
      base = base.substr(0,base.length - 2);
      let p_input = path.join(upper,`${base}_input.txt`);
      
      let p_sh = path.join(upper,`${base}_sh.sh`);
      fs.writeFileSync(p_sh,`#!/bin/bash\n./${base}.exe < ${base}_input.txt > ${base}_output.txt`);
      let p_output = path.join(upper,`${base}_output.txt`);
      let testCases = await AllTestCases.find({
        problemId: new mongoose.Types.ObjectId(req.body.problemId),
      });
      




      var auxContainer;
      docker.createContainer({
      Image: 'gcc',AttachStdin: false,AttachStdout: true,AttachStderr: true,Tty: true,Cmd: ['/bin/bash'],OpenStdin: false,StdinOnce: false
      }).then(function(container) {
      auxContainer = container;
      return auxContainer.start();
      }).then(async(data)=>{
        testCases = testCases[0].testCases;
        for(let i = 0;i<testCases.length;++i){
          fs.writeFileSync(p_input,testCases[i].input);
          let obj = spawnSync(`docker cp ${filePath}  ${auxContainer.id}:/${base}.c`,{encoding:"utf-8",shell:true});
          // console.log(obj);
          if(obj.stderr.length){
            await AllVirdicts.findByIdAndUpdate(id,{
              status:"error",
              comment:"Internal Server Error"
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});
            return;
          }
          obj = spawnSync(`docker cp ${p_input}  ${auxContainer.id}:/${base}_input.txt`,{encoding:"utf-8",shell:true});
          if(obj.stderr.length){
            await AllVirdicts.findByIdAndUpdate(id,{
              status:"error",
              comment:"Internal Server Error"
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});
            return;
          }
          // console.log(obj);
          obj = spawnSync(`docker exec ${auxContainer.id} g++ ${base}.c -o ${base}.exe`,{encoding:"utf-8",shell:true});
          // console.log(obj);
          if(obj.stderr.length){
            await AllVirdicts.findByIdAndUpdate(id,{
              status:"error",
              comment:obj.stderr
            })
            await AllProblems.findByIdAndUpdate(req.body.problemId,{
              wrongSubmission:wrongSubmission + 1
            });
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});
            return;
          }
          // console.log(obj);
          obj = spawnSync(`docker cp ${p_sh} ${auxContainer.id}:/${base}_sh.sh`,{encoding:"utf-8",shell:true});
          // console.log(obj);
          if(obj.stderr.length){
            await AllVirdicts.findByIdAndUpdate(id,{
              status:"error",
              comment:"Internal Server Error"
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});
            return;
          }
          obj = spawnSync(`docker exec ${auxContainer.id} //bin//sh ./${base}_sh.sh`,{encoding:"utf-8",shell:true});
          // console.log(obj);
          if(obj.stderr.length){
            await AllVirdicts.findByIdAndUpdate(id,{
              status:"error",
              comment:obj.stderr
            })
            await AllProblems.findByIdAndUpdate(req.body.problemId,{
              wrongSubmission:wrongSubmission + 1
            });
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});
            return;
          }
          // console.log(obj);
          // obj = spawnSync(`docker exec ${auxContainer.id} ls`,{encoding:"utf-8",shell:true});
          // console.log(obj.stdout);
          obj = spawnSync(`docker cp ${auxContainer.id}:/${base}_output.txt ${p_output}`,{encoding:"utf-8",shell:true})
          // console.log(obj)
          if(obj.stderr.length){
            await AllVirdicts.findByIdAndUpdate(id,{
              status:"error",
              comment:"Internal Server Error"
            })
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});
            return;
          }
          const d1 = fs.readFileSync(p_output,{
            encoding:'utf-8',flag:"r"
          });
          if(d1 === testCases[i].output){
            continue;
          }
          else{
            await AllVirdicts.findByIdAndUpdate(id,{
              status:"error",
              comment:`Wrong Answer on test case ${i + 1}`
            });
            fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});
            return;
          }
          // console.log(obj)
      }
      await AllVirdicts.findByIdAndUpdate(id,{
        status:"success",
        comment:"Correct Answer on all test cases"
      });
      await AllProblems.findByIdAndUpdate(req.body.problemId,{
        correctSubmission:correctSubmission + 1
      });
      fs.unlink(p_input,(err)=>{});fs.unlink(p_sh,err=>{});fs.unlink(p_output,err=>{});
    }).then(function(data) {
        return auxContainer.stop();
      }).then(function(data) {
        return auxContainer.remove();
      }).then(function(data) {
      }).catch(async(err)=>{
        await AllVirdicts.findByIdAndUpdate(id,{
          status:"error",
          comment:"Internal Server Error"
        });
        console.log(err);
      });
    }




    return res.json(verdict);
  }
  catch(err){
    console.log(err);
    return res.json({success: false,
            status: "error",
            comment: "Internal Server error"});
  }
})

app.post("/allSubmission", async (req, res) => {
  try {
    const u = await AllVirdicts.find({
      problemId: new mongoose.Types.ObjectId(req.body.problemId),
    });
    return res.status(200).json(u);
  } catch (err) {
    return res.json(err);
  }
});

app.post("/downloadFile", async (req, res) => {
  return res.download(req.body.filePath);
});

app.post("/createNewProblem", async (req, res) => {
  try {
    const obj = req.body;
    let db = new AllProblems({
      title: obj.title,
      description: obj.description,
      sampleInput: obj.sampleInput,
      sampleOutput: obj.sampleOutput,
      constraints: obj.constraints,
      createdByUserId: new mongoose.Types.ObjectId(obj.createdByUserId),
      createdByUserName: obj.createdByUserName,
    });
    await db.save();
    return res.json(db);
  } catch (err) {
    console.log(`Error while creating new Problem ${err}`);
    return res.status(400).json({ error: err });
  }
});

app.listen(5000, () => {
  console.log("listening on http://localhost:5000");
});

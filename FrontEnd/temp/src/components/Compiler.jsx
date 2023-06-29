import { useState } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import { useSelector } from "react-redux";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid"
import Button from "@mui/material/Button"
import LinearProgress from "@mui/material/LinearProgress";
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
export default function Compiler({ problemId }) {
  const user = useSelector((state) => state.userSlice);
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [timeToExecute, setTimeToExecute] = useState("");
  const [verdict, setVerdict] = useState();
  const [isCorrect,setIsCorrect] = useState(-1);
  const [runLoading, setRunLoading] = useState(false);
  const handleCodeRun = async (e) => {
    e.preventDefault();
    setIsCorrect(-1);
    const payload = {
      language,
      code,
      input,
    };
    try{
      setRunLoading(true);
      let resp = await axios.post("http://localhost:5000/runCode",{
        language,code,input
      });
      let id = resp.data._id;
      if(resp.data._id){
        let a = setInterval(async () => {
          resp = await axios.post("http://localhost:5000/getRunStatus", {
            id
          });
          // console.log(resp.data);
          if (resp.data.status) {
            setOutput(resp.data.message);
            setRunLoading(false);
            clearInterval(a);
          }
        }, 1500);
      }
    }
    catch(err){
      setRunLoading(false);
      setOutput("");
    }
    
  };
  const handleCodeSubmit = async (e) => {
      e.preventDefault();
      setIsCorrect(-1);
    const payload = {
      language,
      code,
      problemId,
      userId: user.userId,
      userName: user.userName,
    };
    try {
      setRunLoading(true);
      let resp = await axios.post(
        "http://localhost:5000/submitProblem",
        payload
      );
      const verdictId = resp.data._id;
    //   console.log(resp.data);
      let a = setInterval(async () => {
        resp = await axios.post("http://localhost:5000/getStatus", {
          verdictId,
        });
        // console.log(resp.data);
        if (resp.data.status !== "pending") {
            if(resp.data.status === "error"){
                setIsCorrect(0);
            }
            else{
                setIsCorrect(1);
            }
            setVerdict(resp.data.comment);
            setRunLoading(false);
          clearInterval(a);
        }
      }, 1000);
    //   setRunLoading(false);
    //   if (resp.data.status === "success") setVerdict("Write Answer");
    //   else {
    //     setVerdict(resp.data.comment);
    //   }
    } catch (err) {
      console.log(err);
      setRunLoading(false);
      setIsCorrect(false);
      setVerdict("Connection Error");
      setVerdict("Connection Error");
    }
  };
  return (
    <Box
        // sx = {{
        //     border:"2px solid black"
        // }}
    >
        <InputLabel id="demo-select-small-label">Language</InputLabel>
      <Select
        labelId="demo-select-small-label"
        id="demo-select-small"
        value={language}
        defaultValue="cpp"
        onChange={e=>setLanguage(e.target.value)}
      >
        <MenuItem value="">
        </MenuItem>
        <MenuItem value="cpp">C++</MenuItem>
        <MenuItem value="c">C</MenuItem>
        <MenuItem value="py">Python</MenuItem>
      </Select>
      <br />
      <textarea style={{width:"100%",backgroundColor:"black",color:"white", fontSize:"20px"}} rows={30} placeholder={`Enter ${language} code here`} value={code} onChange={e=>setCode(e.target.value)}></textarea>
      <br />

        <textarea style={{width:"100%"}} placeholder="Input" name="" id="" rows={6} value = {input} onChange={e=>setInput(e.target.value)}></textarea>
        <textarea style={{width:"100%"}} readOnly placeholder="Output" name="" id="" rows={6} value = {output} onChange={e=>setOutput(e.target.value)}></textarea>
        {
            runLoading && <Box sx = {{width:"100%"}}>
                                <LinearProgress color="secondary" />
                            </Box> 
        }
        {
            isCorrect!=-1 && (
                isCorrect?(
                    <Alert severity="success">
                        <AlertTitle>
                            Error
                        </AlertTitle>
                        {verdict}
                    </Alert>
                ):(
                    <Alert severity="error">
                        <AlertTitle>
                            Error
                        </AlertTitle>
                        {verdict}
                    </Alert>
                )
            )
        }
        

        
        
      <Grid container>
        <Grid align = "center" item md = {6} sm = {6} xs = {12} xl = {12}>
            <Button disabled = {code.length?false:true} onClick={handleCodeRun} variant="contained" sx = {{margin:"5px"}}>
                Run Code
            </Button>
        </Grid>
        <Grid align = "center" item md = {6} sm = {6} xs = {12} xl = {12}>
            <Button sx = {{margin:"5px"}} disabled = {(code.length && user.userName.length)?false:true} onClick={handleCodeSubmit} variant="contained" color="secondary">
                Submit
            </Button>
        </Grid>
      </Grid>
      <Grid>
      </Grid>
    </Box>
  );
}
// <div>
//     {
//         isLoading ?(<Loading/>):verdict
//     }
//     <select name="" id="" onChange={e=>setLanguage(e.target.value)}>
//         <option value="cpp">C++</option>
//         <option value="c">C</option>
//         <option value="py">Python</option>
//     </select>
//     <br />
//     <textarea name="" id="" cols="70" rows="25" placeholder={`Enter ${language} code here`} value={code} onChange={e=>setCode(e.target.value)}></textarea>
//     <div style = {{display:"flex"}}>
//         <textarea name="" id="" cols="30" rows="10" placeholder="Input" value = {input} onChange={e=>setInput(e.target.value)}></textarea><br />
//         <textarea name="" id="" cols="30" rows="10" placeholder="Output" value = {output} onChange={e=>setOutput(e.target.value)} readOnly></textarea>
//     </div>
//     <button onClick={handleCodeRun} disabled = {code.length?false:true}>Run</button> {timeToExecute}<br /> {runLoading && <span>Loading</span>}
//     {
//         user.userName!=="" && <button onClick={handleCodeSubmit} disabled = {code.length?false:true}>Submit</button>
//     }
// </div>

import { useState } from "react" 
import axios from "axios"
import Loading from "./Loading";
export default function Compiler({problemId}){
    const [language,setLanguage] = useState("cpp");
    const [code,setCode] = useState("");
    const [input,setInput] = useState("");
    const [output,setOutput] = useState("");
    const [timeToExecute,setTimeToExecute] = useState("");
    const [isLoading,setIsLoading] = useState(false);
    const [verdict,setVerdict] = useState();
    const [runLoading,setRunLoading] = useState(false);
    const handleCodeRun = async(e)=>{
        e.preventDefault();
        const payload = {
            language,
            code,
            input
        }
        setRunLoading(true);
        const a = await axios.post("http://localhost:5000/runCode",payload);
        if(a.data.stdout)setOutput(a.data.stdout)
        if(a.data.stderr)setOutput(a.data.stderr)
        setRunLoading(false);
        setTimeToExecute(`${a.data.time} Seconds`);
    }
    const handleCodeSubmit = async(e)=>{
        e.preventDefault();
        const payload = {
            language,
            code,
            problemId,
            userId:"648f43b9e24f556aaab9a06f",
        };
        try{
            setIsLoading(true);
            let resp = await axios.post("http://localhost:5000/submitProblem",payload);
            const verdictId = resp.data._id;
            let a = setInterval(async()=>{
                resp = await axios.post("http://localhost:5000/getStatus",{verdictId});
                console.log(resp.data);
                if(resp.data.status !== "pending"){
                    setIsLoading(false);
                    setVerdict(resp.data.comment)
                    clearInterval(a);
                }
            },1000);
            const getData = ()=>{

            }
            // setIsLoading(false);
            // if(resp.data.status === "success")setVerdict("Write Answer");
            // else{
            //     setVerdict(resp.data.comment)
            // }
        }
        catch(err){
            console.log(err);
            isLoading(false);
            setVerdict("Connection Error");
        }
    }
    return(
        <div>
            {
                isLoading ?(<Loading/>):verdict
            }
            <select name="" id="" onChange={e=>setLanguage(e.target.value)}>
                <option value="cpp">C++</option>
                <option value="c">C</option>
                <option value="py">Python</option>
            </select>
            <br />
            <textarea name="" id="" cols="70" rows="25" placeholder={`Enter ${language} code here`} value={code} onChange={e=>setCode(e.target.value)}></textarea>
            <div style = {{display:"flex"}}>
                <textarea name="" id="" cols="30" rows="10" placeholder="Input" value = {input} onChange={e=>setInput(e.target.value)}></textarea><br />
                <textarea name="" id="" cols="30" rows="10" placeholder="Output" value = {output} onChange={e=>setOutput(e.target.value)} readOnly></textarea>
            </div>
            <button onClick={handleCodeRun} disabled = {code.length?false:true}>Run</button> {timeToExecute}<br /> {runLoading && <span>Loading</span>}
            <button onClick={handleCodeSubmit} disabled = {code.length?false:true}>Submit</button>
        </div>
    )
}
import { useState } from "react" 
import axios from "axios"
export default function Compiler({problemId}){
    const [language,setLanguage] = useState("cpp");
    const [code,setCode] = useState("");
    const [input,setInput] = useState("");
    const [output,setOutput] = useState("");
    const [timeToExecute,setTimeToExecute] = useState("");
    const handleCodeRun = async(e)=>{
        e.preventDefault();
        const payload = {
            language,
            code,
            input
        }
        const a = await axios.post("http://localhost:5000/runCode",payload);
        if(a.data.stdout)setOutput(a.data.stdout)
        if(a.data.stderr)setOutput(a.data.stderr)
        setTimeToExecute(a.data.time);
    }
    const handleCodeSubmit = (e)=>{
        e.preventDefault();
    }
    return(
        <div>
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
            <button onClick={handleCodeRun} disabled = {code.length?false:true}>Run</button> {timeToExecute} Seconds<br />
            <button onClick={handleCodeSubmit} disabled = {code.length?false:true}>Submit</button>
        </div>
    )
}
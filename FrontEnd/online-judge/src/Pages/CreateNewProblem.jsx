import {useState} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export default function CreateNewProblem(){
    const [title,setTitle] = useState("");
    const [description,setDescription] = useState("");
    const [sampleInput,setSampleInput] = useState("");
    const [sampleOutput,setSampleOutput] = useState("");
    const [constraints,setConstraints] = useState("");
    const [anyError,setAnyError] = useState("");
    const navigate = useNavigate();
    const handleSubmit = async()=>{
        try{
            const resp = await axios.post("http://localhost:5000/createNewProblem",{
                title,description,sampleOutput,constraints,sampleInput
            });
            navigate("/");   
        }
        catch(err){
            console.log("Error: ",err);
            setAnyError("Error While creating new Problem");
        }
    }
    return(
        <div>
            Title: <input type="text" name="" value = {title} onChange={e=>setTitle(e.target.value)} id="" /><br/>
            Description: <textarea cols="30" rows="10" type="text" name="" value = {description} onChange={e=>setDescription(e.target.value)} id=""></textarea><br/>
            Sample Input: <textarea name="" id="" value = {sampleInput} onChange={e=>setSampleInput(e.target.value)} cols="30" rows="10"></textarea><br/>
            Sample Output: <textarea name="" value={sampleOutput} onChange={e=>setSampleOutput(e.target.value)} id="" cols="30" rows="10"></textarea><br/>
            Constraints: <textarea name="" value={constraints} onChange={e=>setConstraints(e.target.value)} id="" cols="30" rows="10"></textarea><br/>
            <button onClick={handleSubmit}>Submit</button><br/>
            {anyError}
        </div>
    )
}
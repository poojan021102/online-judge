import {useState,useEffect} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FormData from "form-data";
import {useSelector} from "react-redux";
import Box from "@mui/material/Box"
export default function CreateNewProblem(){
    const [title,setTitle] = useState("");
    const [description,setDescription] = useState("");
    const [sampleInput,setSampleInput] = useState("");
    const [sampleOutput,setSampleOutput] = useState("");
    const [constraints,setConstraints] = useState("");
    const [anyError,setAnyError] = useState("");
    const [file,setFile] = useState(null);
    const user = useSelector(state=>state.userSlice)
    const navigate = useNavigate();

    useEffect(()=>{
        if(user.userName === "")navigate("/");
    },[]);

    const handleSubmit = async(e)=>{
        e.preventDefault();
        try{
            let formData = new FormData();
            formData.append("testCases",file);
            const resp = await axios.post("http://localhost:5000/createNewProblem",{
                title,description,sampleOutput,constraints,sampleInput,createdByUserId:user.userId,createdByUserName:user.userName
            });
            formData.append("problemId",resp.data._id);
            const resp2 = await axios.post("http://localhost:5000/enterTestCases",formData,{
                headers:{
                    "Custom-Header":"value"
                }
            });
            if(resp2.data.success){
                navigate("/");   
            }
        }
        catch(err){
            console.log("Error: ",err);
            setAnyError("Error While creating new Problem");
        }
    }
    return(
            <Box>
                
            </Box>
        )
    }
    // <div>
    //     Title: <input type="text" name="" value = {title} onChange={e=>setTitle(e.target.value)} id="" /><br/>
    //     Description: <textarea cols="30" rows="10" type="text" name="" value = {description} onChange={e=>setDescription(e.target.value)} id=""></textarea><br/>
    //     Sample Input: <textarea name="" id="" value = {sampleInput} onChange={e=>setSampleInput(e.target.value)} cols="30" rows="10"></textarea><br/>
    //     Sample Output: <textarea name="" value={sampleOutput} onChange={e=>setSampleOutput(e.target.value)} id="" cols="30" rows="10"></textarea><br/>
    //     Constraints: <textarea name="" value={constraints} onChange={e=>setConstraints(e.target.value)} id="" cols="30" rows="10"></textarea><br/>
    //     <input type="file" name="testCases" id="" onChange={e=>setFile(e.target.files[0])} required/>Upload a JSON file of other test cases <br/>
    //     <button onClick={handleSubmit}>Submit</button><br/>
    //     {anyError}
    // </div>
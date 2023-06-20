import axios from "axios"
import { useState } from "react";
import {useNavigate} from "react-router-dom";
export default function RegisterPage(){
    const [firstName,setFirstName] = useState("");
    const [lastName,setLastName] = useState("");
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [message,setMessage] = useState("");
    const [userName,setUserName] = useState("");
    const navigate = useNavigate();
    const handleRegister = async(e)=>{
        e.preventDefault();
        try{
            const resp = await axios.post("http://localhost:5000/register",{
                firstName,lastName,email,password,userName
            });
            if(resp.data.success){
                navigate("/login");
            }
            else{
                setMessage(resp.data.message);
            }
        }
        catch(err){
            setMessage("Error while creating account")
        }
    }
    return(
        <div>
            <input type="text" value={userName} placeholder="User Name" onChange = {e=>setUserName(e.target.value)}/><br/>
            <input type="text" value = {firstName} onChange={e=>setFirstName(e.target.value)} placeholder="firstName"  /><br />
            <input type="text" value = {lastName} onChange={e=>setLastName(e.target.value)} placeholder="lastName"  /><br />
            <input type="email" value = {email} onChange={e=>setEmail(e.target.value)} placeholder="Email"  /><br />
            <input type="password" value = {password} onChange={e=>setPassword(e.target.value)} placeholder="Password"  /><br />
            <button onClick={handleRegister}>Submit</button><br />
            <p>{message}</p>
        </div>
    )
}
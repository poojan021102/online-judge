import axios from "axios"
import { login } from "../redux/actions"
import {useDispatch} from "react-redux";
import { useState } from "react";
import {useNavigate} from "react-router-dom";
export default function LoginPage(){
    const [userName,setUserName] = useState("");
    const dispatch = useDispatch();
    const [password,setPassword] = useState("");
    const [message,setMessage] = useState("");
    const navigate = useNavigate();
    const handleLogin = async(e)=>{
        e.preventDefault();
        try{
            const resp = await axios.post("http://localhost:5000/login",{
                userName,password
            });
            if(resp.data.success){
                localStorage.setItem("online-judge-token",resp.data.token);
                const u = await axios.post("http://localhost:5000/getUser",{token:resp.data.token});
                dispatch(login({
                    firstName:u.data.firstName,
                    lastName:u.data.lastName,
                    userName:u.data.userName,
                    userId:u.data.id
                    }
                ));
                navigate(-1);
            }
            else{
                setMessage(resp.data.message);
            }
        }
        catch(err){

        }
    }
    return(
        <div>
            <input type="text" value = {userName} onChange={e=>setUserName(e.target.value)} placeholder="User Name"  /><br />
            <input type="password" value = {password} onChange={e=>setPassword(e.target.value)} placeholder="Password"  /><br />
            <button onClick={handleLogin}>Submit</button><br />
            <p>{message}</p>
        </div>
    )
}
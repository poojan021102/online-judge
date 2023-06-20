import {Link} from "react-router-dom";
import {useSelector} from "react-redux"
import { logout } from "../redux/actions";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { login } from "../redux/actions";
import axios from "axios";
export default function Navbar(){
    const user = useSelector(state=>state.userSlice)
    const handleLogout = (e)=>{
        e.preventDefault();
        localStorage.removeItem("online-judge-token");
        dispatch(logout());
    }
    const dispatch = useDispatch();
    useEffect(()=>{
        let token = localStorage.getItem("online-judge-token");
        if(token){
            const fetchInfo = async()=>{
                try{
                    const u = await axios.post("http://localhost:5000/getUser",{token});
                    dispatch(login({
                        firstName:u.data.firstName,
                        lastName:u.data.lastName,
                        email:u.data.lastName,
                        userId:u.data.id,
                        userName:u.data.userName
                    }));
                }
                catch(err){
                    localStorage.removeItem("online-judge-token");
                    dispatch(logout());
                }
            }
            fetchInfo();
        }
        else{
            dispatch(logout());
        }
    },[]);
    return(
        <div style={{border:"2px solid black"}}>
            <p>Navbar Component</p>
            {
                user.userName !== "" && <p><Link to="/createNewProblem">Create New Problem</Link></p>
            }
            <Link to="/register">Register</Link><br/>
            {
                user.userName === ''?(<Link to = "/login">Login</Link>):<button onClick={handleLogout}>Logout</button>
            }
        </div>
    )
}
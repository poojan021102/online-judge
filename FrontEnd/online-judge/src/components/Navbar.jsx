import {Link} from "react-router-dom";
import Button from '@mui/material/Button';
import {useSelector} from "react-redux"
import { logout } from "../redux/actions";
import { useDispatch } from "react-redux";
import Stack from '@mui/material/Stack';
import { useEffect } from "react";
import { login } from "../redux/actions";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import axios from "axios";
import Avatar from '@mui/material/Avatar';
import { deepPurple } from '@mui/material/colors';
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
                    const u = await axios.post("https://online-judge-5bu5.onrender.com/getUser",{token});
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
    const showWithoutLogin = ()=>{
        return(
            <Grid container sx={{justifyContent:"center", alignItems:"center"}}>
                <Grid item md = {6} sm = {6} xs = {12} align = "center">
                    <Link to = "/" style={{textDecoration:"none"}}>
                            <Grid container sx={{justifyContent:"center", alignItems:"center"}} direction="column">
                                <Grid item>
                                    <Avatar sx={{bgcolor:deepPurple[500]}}>OJ</Avatar>
                                </Grid>
                                <Grid item>
                                    Online Judge
                                </Grid>
                            </Grid>
                    </Link>
                </Grid>
                <Grid item md = {6} sm = {6} xs = {12} align = "center">
                    <Box sx = {{display:"flex",justifyContent:"center",alignItems:"center"}}>
                        <Stack spacing={2} direction = "row">
                            <Link to = "/login" style={{textDecoration:"none"}}>
                                <Button color="secondary" variant="contained">
                                    Login
                                </Button>
                            </Link>
                            <Link to = "/register" style = {{textDecoration:"none"}}>
                                <Button variant="filled">
                                    Register
                                </Button>
                            </Link>
                        </Stack>
                    </Box>
                        
                </Grid>
            </Grid>
        )
    }
    const showWithLogin = ()=>{
        return(
            <Grid container sx={{justifyContent:"center", alignItems:"center"}}>
                <Grid item md = {3} sm = {12} xs = {12} align = "center">
                    <Link to = "/" style={{textDecoration:"none"}}>
                            <Grid container sx={{justifyContent:"center", alignItems:"center"}} direction="column">
                                <Grid item>
                                    <Avatar sx={{bgcolor:deepPurple[500]}}>OJ</Avatar>
                                </Grid>
                                <Grid item>
                                    Online Judge
                                </Grid>
                            </Grid>
                    </Link>
                </Grid>
                <Grid item xs = {12} sm = {4} md = {3} align = "center">
                    <Link to = "/createNewProblem" style = {{textDecoration:"none"}}>
                        <Button variant="filled" color="secondary">
                            Crete New Problem
                        </Button>
                    </Link>
                </Grid>
                <Grid item xs = {12} sm = {4} md = {3} align = "center">
                    <Link to = "/myAllSubmission">
                        <Button variant="filled" color="warning">
                            My All Submissions
                        </Button>
                    </Link>
                </Grid>
                <Grid item xs = {12} sm = {4} md = {3} align = "center">
                    <Button onClick={handleLogout} color="error" variant="contained">
                        Logout
                    </Button>
                </Grid>
            </Grid>
        )
    }
    return(
        <Box sx = {{bgcolor:"#cfd8dc", padding:"5px",position:"sticky",top:"0",zIndex:"100"}}>
            {
                (!user || !user.userName || !user.userName.length)?(showWithoutLogin()):showWithLogin()
            }
        </Box>
    )
}
{/* <div style={{border:"2px solid black"}}>
    <p>Navbar Component</p>
    {
        user.userName !== "" && <p><Link to="/createNewProblem">Create New Problem</Link></p>
    }
    <Link to="/register">Register</Link><br/>
    {
        user.userName === ''?(<Link to = "/login">Login</Link>):<button onClick={handleLogout}>Logout</button>
    }
</div> */}
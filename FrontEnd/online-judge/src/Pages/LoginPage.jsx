import axios from "axios"
import { login } from "../redux/actions"
import {useDispatch} from "react-redux";
import { useState } from "react";
import {useNavigate} from "react-router-dom";
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button'
import Box from '@mui/material/Box';
import Typography from "@mui/material/Typography";
import Modal from '@mui/material/Modal';
import LinearProgress from '@mui/material/LinearProgress';
export default function LoginPage(){
    const [userName,setUserName] = useState("");
    const dispatch = useDispatch();
    const [password,setPassword] = useState("");
    const [message,setMessage] = useState("");
    const [openModal,setOpenModal] = useState(false);
    const navigate = useNavigate();
    const [isLoading,setIsLoading] = useState(false);
    const handleLogin = async(e)=>{
        e.preventDefault();
        if(userName.length === 0 || password.length === 0){
            setOpenModal(true);
            setMessage("The userName or Password field should not be empty")
            return;
        }
        try{
            setIsLoading(true);
            const resp = await axios.post("https://online-judge-5bu5.onrender.com/login",{
                userName,password
            });
            if(resp.data.success){
                localStorage.setItem("online-judge-token",resp.data.token);
                const u = await axios.post("https://online-judge-5bu5.onrender.com/getUser",{token:resp.data.token});
                dispatch(login({
                    firstName:u.data.firstName,
                    lastName:u.data.lastName,
                    userName:u.data.userName,
                    userId:u.data.id
                }
                ));
                setIsLoading(false);
                navigate(-1);
            }
            else{
                setIsLoading(false);
                setOpenModal(true);
                setMessage(resp.data.message);
            }
        }
        catch(err){
            setIsLoading(false);
            setMessage("Internal Error")
        }
    }
    return(
        <Box sx = {{width:"100%",height:"100vh",bgcolor:"#81d4fa",display:"flex",justifyContent:"center",alignItems:'center',flexDirection:"column"}}>
            {
                isLoading&&<Box sx ={{width:"40vw",position:"sticky"}}>
                                <LinearProgress color="primary"/>
                            </Box>
            }
            <Box sx = {{width:"40vw",height:"50vh",bgcolor:"white",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",borderRadius:"5px",
            transition: "transform .5s, box-shadow 0.5s",
            "&:hover":{
                boxShadow: "5px 5px 5px rgba(60, 60, 93, 0.33)"
            }
        }}>
                

            <Typography variant="h5" sx = {{fontWeight:"bolder"}}>Log In</Typography>
                <Stack direction="column" spacing={3} sx = {{width:"90%"}}>
                    <TextField
                        id="filled-required"
                        label="UserName"
                        defaultValue={userName}
                        onChange={e=>setUserName(e.target.value)}
                        variant="standard"
                        color="secondary"
                    />
                    <TextField
                        id="filled-password-input"
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        variant="standard"
                        defaultValue={password}
                        color="secondary"
                        onChange={e=>setPassword(e.target.value)}
                    />
                    <Button variant="contained" onClick={handleLogin} color="secondary" size = "medium">
                        Login
                    </Button>
                </Stack>
            </Box>
            <Modal
                open = {openModal}
                onClose = {()=>setOpenModal(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx = {{position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 400,
                            bgcolor: 'background.paper',
                            border: '2px solid #000',
                            boxShadow: 24,
                            p: 4,}}
                >
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Important Message
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        {message}
                    </Typography>
                </Box>
            </Modal>
        </Box>
    )
}
{/* <input type="text" value = {userName} onChange={e=>setUserName(e.target.value)} placeholder="User Name"  /><br />
<input type="password" value = {password} onChange={e=>setPassword(e.target.value)} placeholder="Password"  /><br />
<button onClick={handleLogin}>Submit</button><br />
<p>{message}</p> */}
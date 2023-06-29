import axios from "axios"
import { useState } from "react";
import {useNavigate} from "react-router-dom";
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button'
import Box from '@mui/material/Box';
import Typography from "@mui/material/Typography";
import Modal from '@mui/material/Modal';
import LinearProgress from '@mui/material/LinearProgress';
export default function RegisterPage(){
    const [firstName,setFirstName] = useState("");
    const [lastName,setLastName] = useState("");
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [message,setMessage] = useState("");
    const [userName,setUserName] = useState("");
    const [isLoading,setIsLoading] = useState(false);
    const [openModal,setOpenModal] = useState(false);
    const navigate = useNavigate();
    const handleRegister = async(e)=>{
        e.preventDefault();
        if(userName.length === 0 || firstName.length === 0 || lastName.length === 0 || password.length === 0){
            setOpenModal(true);
            setMessage("The feild should not remain empty");
            return;
        }
        try{
            setIsLoading(true);
            const resp = await axios.post("http://localhost:5000/register",{
                firstName,lastName,email,password,userName
            });
            setIsLoading(false);
            if(resp.data.success){
                navigate("/login");
            }
            else{
                setOpenModal(true);
                setMessage(resp.data.message);
            }
        }
        catch(err){
            setIsLoading(false);
            setOpenModal(true);
            setMessage("Error while creating account")
        }
    }
    return(
        <Box sx = {{width:"100%",height:"100vh",bgcolor:"#81d4fa",display:"flex",justifyContent:"center",alignItems:'center',flexDirection:"column"}}>
            {
                isLoading &&<Box sx ={{width:"40vw",position:"sticky",top:"0px"}}>
                                <LinearProgress color="primary"/>
                            </Box>
            }
            <Box sx = {{width:"40vw",height:"70vh",bgcolor:"white",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",borderRadius:"5px",
            transition: "transform .5s, box-shadow 0.5s",
            "&:hover":{
                boxShadow: "5px 5px 5px rgba(60, 60, 93, 0.33)"
            }
        }}>
                

            <Typography variant="h5" sx = {{fontWeight:"bolder"}}>Register</Typography>
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
                        id="filled-required"
                        label="First Name"
                        defaultValue={firstName}
                        onChange={e=>setFirstName(e.target.value)}
                        variant="standard"
                        color="secondary"
                    />
                    <TextField
                        id="filled-required"
                        label="Last Name"
                        defaultValue={lastName}
                        onChange={e=>setLastName(e.target.value)}
                        variant="standard"
                        color="secondary"
                    />
                    <TextField
                        id="filled-required"
                        label="Email"
                        type = "email"
                        defaultValue={email}
                        onChange={e=>setEmail(e.target.value)}
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
                    <Button variant="contained" onClick={handleRegister} color="secondary" size = "medium">
                        Register
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
{/* <input type="text" value={userName} placeholder="User Name" onChange = {e=>setUserName(e.target.value)}/><br/>
<input type="text" value = {firstName} onChange={e=>setFirstName(e.target.value)} placeholder="firstName"  /><br />
<input type="text" value = {lastName} onChange={e=>setLastName(e.target.value)} placeholder="lastName"  /><br />
<input type="email" value = {email} onChange={e=>setEmail(e.target.value)} placeholder="Email"  /><br />
<input type="password" value = {password} onChange={e=>setPassword(e.target.value)} placeholder="Password"  /><br />
<button onClick={handleRegister}>Submit</button><br />
<p>{message}</p> */}
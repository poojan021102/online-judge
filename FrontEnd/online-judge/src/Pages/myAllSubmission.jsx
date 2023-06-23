import { useEffect,useState } from "react";
import {useSelector} from "react-redux"
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FileDownload from "js-file-download";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from "@mui/material/Button"
import Chip from '@mui/material/Chip';
import Box from "@mui/material/Box"
import DownloadIcon from '@mui/icons-material/Download';
import LinearProgress from "@mui/material/LinearProgress"
export default function MyAllSubmission(){
    const user = useSelector(state=>state.userSlice);
    const [info,setInfo] = useState([]);
    const navigate = useNavigate();
    const [isLoading,setIsLoading] = useState(false);
    const handleDownloadFile=async(e,filePath)=>{
        e.preventDefault();
        try{
            const resp = await axios.post("http://localhost:5000/downloadFile",{
                filePath
            });
            let i = filePath.length;
            while(i >= 0 && filePath[i] != '.')--i;
            FileDownload(resp.data,`code.${filePath.substr(i)}`);
        }
        catch(err){
            console.log(err);
        }
        
    }
    useEffect(()=>{
        if(user.userName.length === 0){
            navigate("/");
        }
        else{
            const fetchInformation = async()=>{
                setIsLoading(true);
                try{
                    const resp = await axios.post("http://localhost:5000/myAllSubmission",{
                        userId:user.userId
                    });
                    for(let i = resp.data.length - 1;i >= 0;--i){
                        setInfo(pre=>[...pre,resp.data[i]]);
                    }
                }
                catch(err){
                    console.log(err)
                }
                setIsLoading(false);
            }
            fetchInformation();
        }
    },[]);
    return(
        <TableContainer component = {Paper}>
            {
                isLoading &&<Box sx ={{width:"100%",position:"fixed",top:"0px"}}>
                                <LinearProgress color="primary"/>
                            </Box>
            }
            <Table sx={{ minWidth: 650 }} aria-label="simple table">

            <TableHead>
                <TableRow>
                    <TableCell align="center">User Name</TableCell>
                    <TableCell align="center">Language</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Verdict</TableCell>
                    <TableCell align="center">Code</TableCell>
                </TableRow>
            </TableHead>
                {
                    info.map((item,index)=>{
                        return (
                            <TableBody key = {index}>
                                <TableCell align = "center">{item.userName}</TableCell>
                                <TableCell align="center">{item.language}</TableCell>
                                <TableCell align = "center">
                                    {
                                        item.status==="success"?(<Chip label = "Accepted" color="success"/>):(<Chip label ={item.status} color="error"/>)
                                    }
                                </TableCell>
                                <TableCell align = "center">{item.comment}</TableCell>
                                <TableCell align = "center">
                                    <Button startIcon = {<DownloadIcon/>} variant = "contained" size = "small" color="secondary" onClick={(e)=>handleDownloadFile(e,item.filePath)}>
                                        Download
                                    </Button>
                                </TableCell>
                            </TableBody>
                        )
                    })
            }
            </Table>
        </TableContainer>
    )
}
{/* <table>
    <thead>
        <td>User Name</td>
        <td>Comment</td>
        <td>Code</td>
    </thead>
    {
        info.map((item,index)=>{
            return (
                <tr key = {index}>
                    <td>{item.userName}</td>
                    <td>{item.comment}</td>
                    <td><button onClick={(e)=>handleDownloadFile(e,item.filePath)}>Download</button></td>
                </tr>
            )
        })
    }
</table> */}
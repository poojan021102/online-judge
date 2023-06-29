import { useParams } from "react-router-dom"
import {useState,useEffect} from "react";
import Compiler from "../components/Compiler"
import {Link} from "react-router-dom";
import LinearProgress from '@mui/material/LinearProgress';
import Typography from "@mui/material/Typography"
import axios from "axios"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField";
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from "@mui/material/Grid";
export default function ProblemPage(){
    const {id} = useParams();
    const [problem,setProblem] = useState({title:"",
                                            description:"",
                                            constraints:"",
                                            sampleInput:"",
                                            sampleOutput:"",
                                            correctSubmission:"",
                                            wrongSubmission:"",
                                        });
    const [isLoading,setIsLoading] = useState(false);
    useEffect(()=>{
        const fetchInformation = async()=>{
            try{
                setIsLoading(true);
                const resp = await axios.post("http://localhost:5000/getProblem",{id});
                if(resp.data.err){

                }
                else{
                    setProblem(pre=>({
                        ...pre,...resp.data
                    }));
                }
                setIsLoading(false);
            }
            catch(err){
                console.log("Error",err);
                setIsLoading(false);
            }
        }
        fetchInformation();
    },[]);
    return(
        <Box
        sx={{
            width: "100%",
            height: "100%",
            bgcolor: "#81d4fa",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >

<Box
        sx={{
            width: "90vw",
            //   height: "100vh",
            bgcolor: "white",
            margin:"30px",
            padding:"20px",
            //   display: "flex",
            //   flexDirection: "column",
            //   justifyContent: "left",
            alignItems: "center",
            borderRadius: "5px",
            transition: "transform .5s, box-shadow 0.5s",
            "&:hover": {
                boxShadow: "5px 5px 5px rgba(60, 60, 93, 0.33)",
            },
        }}
        >
            { isLoading && (
            <Box sx={{ width: "90vw", position: "sticky", top: "0px" }}>
                <LinearProgress color="primary" />
            </Box>
            )}
            <Grid container>
                <Grid item sm = {6} md = {6} xl = {6} xs = {12}>
                    <Typography variant="h4" sx = {{fontWeight:"bolder"}}>{problem.title}</Typography>
                </Grid>
                <Grid item sm = {6} md = {6} xl = {6} xs = {12} align = "">
                    <Grid container sx = {{justifyContent:"space-around", alignItems:"center"}}>
                        <Grid item md = {6} xl = {6} sm = {6} xs = {12}>
                            <Link to = {`/allSubmission/${id}`}>
                                <Button variant = "contained" sx = {{margin:"2px"}}>
                                    All Submissions
                                </Button>
                            </Link>
                        </Grid>
                        <Grid item md = {6} xl = {6} sm = {6} xs = {12}>
                            <Link to={`/mySubmission/${id}`}>
                                <Button variant = "contained" color="secondary" sx = {{margin:"2px"}}>
                                    My Submission
                                </Button>
                            </Link>
                        </Grid>
                    </Grid>
                </Grid>

            </Grid>
            <hr />
            <Typography sx = {{}}>
                {problem.description}
            </Typography>
            <hr />
            <Typography>
                {problem.constraints}
            </Typography>
            <hr />
            <Box sx = {{display:"flex", justifyContent:"space-between",alignItems:"center"}}>
            </Box>
            <TextField sx = {{marginTop:"20px"}} readOnly value={problem.sampleInput} label = "Sample Input"/>
            <br />
            <TextField sx = {{marginTop:"20px", marginBottom:"20px"}} readOnly value={problem.sampleOutput} label = "Sample Output"/>
            <hr />
            <Compiler problemId={id}/>
        </Box>
            
        </Box>
    )
    }
    // <div>
    //     <h1>{problem.title}</h1>
    //     <Link to = {`/allSubmission/${id}`}>All Submissions</Link><br />
    //     <Link to={`/mySubmission/${id}`}>My Submission For This Problem</Link>
    //     <p>{problem.description}</p>
    //     <p>{problem.constraints}</p>
    //     <textarea name="" id="" cols="30" rows="10" value={problem.sampleInput} readOnly>{problem.sampleInput}</textarea><br />
    //     <textarea name="" id="" cols="30" rows="10" value={problem.sampleOutput} readOnly>{problem.sampleOutput}</textarea><br />
    //     <br />
    //     <Compiler problemId = {id}/>
    // </div>
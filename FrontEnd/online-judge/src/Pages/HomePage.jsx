import {useState,useEffect} from "react";
import axios from "axios";
import ProblemPoster from "../components/ProblemPoster";
import LinearProgress from '@mui/material/LinearProgress';
import Box from "@mui/material/Box"
export default function HomePage(){
    const [allProblems,setAllProblems] = useState([]);
    const [isLoading,setIsLoading] = useState(false);
    useEffect(()=>{
        const fetchAllProblems = async()=>{
            try{
                setIsLoading(true);
                const resp = await axios.get("https://online-judge-5bu5.onrender.com/AllProblems");
                if(resp.data.err)return;
                for(let i = 0;i < resp.data.length;++i){
                    setAllProblems(prev=>[...prev,resp.data[i]]);
                }
                setIsLoading(false);
            }
            catch(err){
                setIsLoading(false);
                console.log(err);
            }
        }
        fetchAllProblems();
    },[])
    return(
        <div style = {{width:"100%",marginTop:"20px"}}>
             {
                isLoading &&<Box sx ={{width:"100%",position:"sticky"}}>
                                <LinearProgress color="primary"/>
                            </Box>
            }
            {
                allProblems.map((problem,index)=>{
                    return <ProblemPoster key = {index} title = {problem.title} id={problem._id} correctSubmission = {problem.correctSubmission} wrongSubmission = {problem.wrongSubmission}/>
                })
            }
        </div>
    )
}
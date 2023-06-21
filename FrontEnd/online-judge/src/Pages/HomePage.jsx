import {useState,useEffect} from "react";
import axios from "axios";
import ProblemPoster from "../components/ProblemPoster";
export default function HomePage(){
    const [allProblems,setAllProblems] = useState([]);
    useEffect(()=>{
        const fetchAllProblems = async()=>{
            try{
                const resp = await axios.get("http://localhost:5000/AllProblems");
                if(resp.data.err)return;
                for(let i = 0;i < resp.data.length;++i){
                    setAllProblems(prev=>[...prev,resp.data[i]]);
                }
            }
            catch(err){
                console.log(err);
            }
        }
        fetchAllProblems();
    },[])
    return(
        <div style = {{width:"100%",marginTop:"20px"}}>
            {
                allProblems.map((problem,index)=>{
                    return <ProblemPoster key = {index} title = {problem.title} id={problem._id} correctSubmission = {problem.correctSubmission} wrongSubmission = {problem.wrongSubmission}/>
                })
            }
        </div>
    )
}
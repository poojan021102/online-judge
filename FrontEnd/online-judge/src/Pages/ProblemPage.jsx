import { useParams } from "react-router-dom"
import {useState,useEffect} from "react";
import Compiler from "../components/Compiler"
import {Link} from "react-router-dom";
import axios from "axios"
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
    useEffect(()=>{
        const fetchInformation = async()=>{
            try{
                const resp = await axios.post("http://localhost:5000/getProblem",{id});
                if(resp.data.err){}
                else{
                    setProblem(pre=>({
                        ...pre,...resp.data
                    }));
                }
            }
            catch(err){
                console.log("Error",err);
            }
        }
        fetchInformation();
    },[]);
    return(
        <div>
            <h1>{problem.title}</h1>
            <Link to = {`/allSubmission/${id}`}>All Submissions</Link><br />
            <Link>My Submission For This Problem</Link>
            <p>{problem.description}</p>
            <p>{problem.constraints}</p>
            <textarea name="" id="" cols="30" rows="10" value={problem.sampleInput} readOnly>{problem.sampleInput}</textarea><br />
            <textarea name="" id="" cols="30" rows="10" value={problem.sampleOutput} readOnly>{problem.sampleOutput}</textarea><br />
            <br />
            <Compiler problemId = {id}/>
        </div>
    )
}
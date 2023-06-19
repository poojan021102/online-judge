import { useParams } from "react-router-dom"
import { useEffect,useState } from "react";
import axios from "axios";
export default function AllSubmission(){
    const {id} = useParams();
    const [info,setInfo] = useState([]);
    useEffect(()=>{
        const fetchInformation = async()=>{
            try{
                const resp = await axios.post("http://localhost:5000/allSubmission",{
                    problemId:id
                });
                for(let i = 0;i < resp.data.length;++i){
                    setInfo(pre=>[...pre,resp.data[i]]);
                }
                console.log(info)
            }
            catch(err){
                console.log(err)
            }
        }
        fetchInformation();
    },[]);
    return(
        <>
            All Submission Page
        </>
    )
}
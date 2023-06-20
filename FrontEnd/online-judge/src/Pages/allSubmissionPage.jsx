import { useParams } from "react-router-dom"
import { useEffect,useState } from "react";
import axios from "axios";
import FileDownload from "js-file-download";
export default function AllSubmission(){
    const {id} = useParams();
    const [info,setInfo] = useState([]);
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
        const fetchInformation = async()=>{
            try{
                const resp = await axios.post("http://localhost:5000/allSubmission",{
                    problemId:id
                });
                for(let i = 0;i < resp.data.length;++i){
                    setInfo(pre=>[...pre,resp.data[i]]);
                }
            }
            catch(err){
                console.log(err)
            }
        }
        fetchInformation();
    },[]);
    return(
        <>
            <table>
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
            </table>
        </>
    )
}
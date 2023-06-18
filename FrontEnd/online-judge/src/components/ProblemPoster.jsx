import { Link } from "react-router-dom"
export default function ProblemPoster({title,id,correctSubmission,wrongSubmission}){
    return(
        <Link to = {`problem/${id}`}>
            <div style = {{margin:"3px",borderRadius:"3px",width:"90%",border:"2px solid black"}}>
                <h2>{title}</h2>
                <h3>{(correctSubmission === 0)?(0):(wrongSubmission === 0?(100):(correctSubmission/wrongSubmission)*100)}%</h3>
            </div>
        </Link>
    )
}
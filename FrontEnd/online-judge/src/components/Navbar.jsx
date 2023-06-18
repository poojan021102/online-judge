import {Link} from "react-router-dom";
export default function Navbar(){
    return(
        <div style={{border:"2px solid black"}}>
            <p>Navbar Component</p>
            <p><Link to="/createNewProblem">Create New Problem</Link></p>
        </div>
    )
}
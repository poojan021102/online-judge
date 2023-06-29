import { Link } from "react-router-dom"
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
export default function ProblemPoster({title,id,correctSubmission,wrongSubmission}){
    return(
            <Box sx = {{width:"97%",bgcolor:"#e8f5e9", borderRadius:"5px",margin:"auto",transition: "transform .5s, box-shadow 0.5s",border:"3px solid #76ff03",
                "&:hover":{
                    boxShadow: "4px 4px 4px rgba(60, 60, 93, 0.33)"
                }
            ,marginTop:"20px"}}>
                    <Typography variant="h5" sx = {{paddingLeft:"20px",paddingBottom:"20px",paddingTop:"20px",display:"flex",justifyContent:"center",alignItems:"center"}}>
                        {title}
                    </Typography>
                <Grid container>
                    <Grid item xl = {6} sm = {6} xs = {12}>
                        <Typography variant="h6" sx = {{paddingBottom:"20px",display:"flex",justifyContent:"center",alignItems:"center"}}>
                            Success Rate: {Math.round((correctSubmission === 0)?(0):(wrongSubmission === 0?(100):(correctSubmission/(wrongSubmission + correctSubmission))*100))}%
                        </Typography>
                    </Grid>
                    <Grid item xl = {6} xs = {12} sm={6} sx = {{display:"flex",justifyContent:"center",paddingBottom:"20px",alignItems:"center"}}>
                        <Link to = {`problem/${id}`} style={{textDecoration:"none"}}>
                            <Button size="large" variant="contained" color="success">
                                Solve This Problem
                            </Button>
                        </Link>
                    </Grid>
                </Grid>
            </Box>
        )
    }
    // <Link to = {`problem/${id}`}>
    //     <div style = {{margin:"3px",borderRadius:"3px",width:"90%",border:"2px solid black"}}>
    //         <h2>{title}</h2>
    //         <h3>{(correctSubmission === 0)?(0):(wrongSubmission === 0?(100):(correctSubmission/(wrongSubmission + correctSubmission))*100)}%</h3>
    //     </div>
    // </Link>
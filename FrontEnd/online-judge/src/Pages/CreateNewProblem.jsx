import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FormData from "form-data";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import TextareaAutosize from '@mui/base/TextareaAutosize';
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack"
import LinearProgress from '@mui/material/LinearProgress';
import TextField from "@mui/material/TextField";
import Modal from "@mui/material/Modal"
import Button from "@mui/material/Button";
export default function CreateNewProblem() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sampleInput, setSampleInput] = useState("");
  const [sampleOutput, setSampleOutput] = useState("");
  const [constraints, setConstraints] = useState("");
  const [file, setFile] = useState(null);
  const user = useSelector((state) => state.userSlice);
  const navigate = useNavigate();
  const [isLoading,setIsLoading] = useState(false);
  const [openModal,setOpenModal] = useState(false);
  const [message,setMessage] = useState("");
  useEffect(() => {
        if(user.userName.length === 0)navigate("/");
    },[]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if(title.length === 0 || description.length === 0 || sampleInput.length === 0 || sampleOutput.length === 0 || constraints.length === 0){
        setOpenModal(true);
        setMessage("Any Feild Should Not be empty")
        return;
    }
    if(!file){
        setOpenModal(true);
        setMessage("Please Upload Test Case File")
        return;
    }
    try {
        setIsLoading(true);
        let formData = new FormData();
        formData.append("testCases", file);
        const resp = await axios.post("https://online-judge-5bu5.onrender.com/createNewProblem", {
            title,
            description,
            sampleOutput,
            constraints,
            sampleInput,
            createdByUserId: user.userId,
            createdByUserName: user.userName,
        });
        formData.append("problemId", resp.data._id);
        const resp2 = await axios.post(
            "https://online-judge-5bu5.onrender.com/enterTestCases",
            formData,
            {
            headers: {
                "Custom-Header": "value",
            },
            }
        );
        if (resp2.data.success) {
            setIsLoading(false);
            navigate("/");
        }
        else{
            setOpenModal(true);
            setMessage("Internal Error");
        }
    } 
    catch (err) {
        setOpenModal(true);
        setMessage("Internal Error");
      console.log("Error: ", err);
    }
  };
  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        bgcolor: "#81d4fa",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          width: "50vw",
          height: "70vh",
          bgcolor: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "5px",
          transition: "transform .5s, box-shadow 0.5s",
          "&:hover": {
            boxShadow: "5px 5px 5px rgba(60, 60, 93, 0.33)",
          },
        }}
      >
        {isLoading && (
          <Box sx={{ width: "100%", position: "sticky", top: "0px" }}>
            <LinearProgress color="primary" />
          </Box>
        )}

        <Typography variant="h5" sx={{ fontWeight: "bolder" }}>
          Create A New Problem
        </Typography>
        <Stack direction="column" spacing={3} sx={{ width: "90%" }}>
          <TextField
            id="filled-required"
            label="Problem Title"
            defaultValue={title}
            onChange={(e) => setTitle(e.target.value)}
            variant="standard"
            color="secondary"
          />
          <TextareaAutosize placeholder = "Problem Description" minRows={10} value={description} onChange={e=>setDescription(e.target.value)}/>
          <Box sx = {{display:'flex',justifyContent:"space-between",alignItems:"center"}}>
            <TextareaAutosize placeholder = "Sample Input" minRows={5} value={sampleInput} onChange={e=>setSampleInput(e.target.value)}/>
            <TextareaAutosize placeholder = "Sample Output" minRows={5} value={sampleOutput} onChange={e=>setSampleOutput(e.target.value)}/>
            <TextareaAutosize placeholder = "Constraints" minRows={5} value={constraints} onChange={e=>setConstraints(e.target.value)}/>
          </Box>
            <input type="file" name="testCases" id="" onChange={e=>setFile(e.target.files[0])} required/>
            <Button variant="contained" color="secondary" onClick={handleSubmit}>
                Add Problem
            </Button>
        </Stack>
      </Box>
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Important Message
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {message}
          </Typography>
        </Box>
      </Modal>
    </Box>
  );
}
// <div>
//     Title: <input type="text" name="" value = {title} onChange={e=>setTitle(e.target.value)} id="" /><br/>
//     Description: <textarea cols="30" rows="10" type="text" name="" value = {description} onChange={e=>setDescription(e.target.value)} id=""></textarea><br/>
//     Sample Input: <textarea name="" id="" value = {sampleInput} onChange={e=>setSampleInput(e.target.value)} cols="30" rows="10"></textarea><br/>
//     Sample Output: <textarea name="" value={sampleOutput} onChange={e=>setSampleOutput(e.target.value)} id="" cols="30" rows="10"></textarea><br/>
//     Constraints: <textarea name="" value={constraints} onChange={e=>setConstraints(e.target.value)} id="" cols="30" rows="10"></textarea><br/>
//     <input type="file" name="testCases" id="" onChange={e=>setFile(e.target.files[0])} required/>Upload a JSON file of other test cases <br/>
//     <button onClick={handleSubmit}>Submit</button><br/>
//     {anyError}
// </div>

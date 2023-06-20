import Layout from "./Layout";
import {Routes,Route} from "react-router-dom";
import HomePage from "./Pages/HomePage";
import ProblemPage from "./Pages/ProblemPage";
import CreateNewProblem from "./Pages/CreateNewProblem";
import AllSubmission from "./Pages/allSubmissionPage";
import MySubmissionPage from "./Pages/MySubmissionPage";
import RegisterPage from "./Pages/registerPage";
import LoginPage from "./Pages/LoginPage";
export default function App(){

  return(
    <Routes>
      <Route path = "/" element = {<Layout/>}>
        <Route index element = {<HomePage />}/>
        <Route path = "/problem/:id" element = {<ProblemPage/>}/>
        <Route path = "/createNewProblem" element = {<CreateNewProblem/>} />
        <Route path="/allSubmission/:id" element = {<AllSubmission/>}/>
        <Route path = "/mySubmission/:id" element = {<MySubmissionPage/>}/>
        <Route path="/register" element={<RegisterPage/>}/>
        <Route path = "/login" element = {<LoginPage/>}/>
      </Route>
    </Routes>
  )
}
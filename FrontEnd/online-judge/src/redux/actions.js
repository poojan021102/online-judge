import { createSlice } from '@reduxjs/toolkit'
import axios from "axios";
const userSlice = createSlice({
  name: 'user',
  initialState: {
    firstName:"",
    lastName:"",
    email:"",
    userId:"",
    userName:""
  },
  reducers: {
    // checkIfUserAlreadyExists: (state,user) => {
    //   state.firstName = user.payload.firstName;
    //   state.lastName = user.payload.lastName;
    //   state.email = user.payload.email;
    // },
    login: (state,user) => {
      state.firstName = user.payload.firstName;
      state.lastName = user.payload.lastName;
      state.email = user.payload.email; 
      state.userId = user.payload.userId;
      state.userName = user.payload.userName;
    },
    logout:state=>{
      state.firstName = "";
      state.lastName = "";
      state.email = "";
      state.userId ="";
      state.userName = "";
    }
  }
})

export const { login,logout } = userSlice.actions
export default userSlice.reducer;
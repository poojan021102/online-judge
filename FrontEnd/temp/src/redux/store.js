import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./actions"
export const store = configureStore({
    reducer:{userSlice}
})
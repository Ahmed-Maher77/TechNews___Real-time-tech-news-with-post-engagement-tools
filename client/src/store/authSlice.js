import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    auth: null,
    bootstrapped: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuth(state, action) {
            state.auth = action.payload;
        },
        clearAuth(state) {
            state.auth = null;
        },
        setBootstrapped(state, action) {
            state.bootstrapped = action.payload;
        },
    },
});

export const { setAuth, clearAuth, setBootstrapped } = authSlice.actions;
export const selectAuth = (state) => state.auth.auth;
export const selectIsLoggedIn = (state) => Boolean(state.auth.auth);
export const selectRole = (state) => state.auth.auth?.role || "user";
export const selectAuthBootstrapped = (state) => state.auth.bootstrapped;

export default authSlice.reducer;

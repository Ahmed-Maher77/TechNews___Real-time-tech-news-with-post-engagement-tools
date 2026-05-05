import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isSidebarCollapsed: false,
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        toggleSidebarCollapsed(state) {
            state.isSidebarCollapsed = !state.isSidebarCollapsed;
        },
    },
});

export const { toggleSidebarCollapsed } = uiSlice.actions;
export const selectIsSidebarCollapsed = (state) => state.ui.isSidebarCollapsed;

export default uiSlice.reducer;

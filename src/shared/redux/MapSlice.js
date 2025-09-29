import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    view: null,
    map: null,
};

const MapSlice = createSlice({
    name: "mapSlice",
    initialState,
    reducers: {
        ToggleView: (state, action) => {
            return {
                ...initialState,
                view: action.payload.view,
                map: action.payload.map,
            };
        },
    },
});

export const { ToggleView } = MapSlice.actions;

export default MapSlice.reducer;

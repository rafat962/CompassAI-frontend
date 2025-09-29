/* eslint-disable no-unused-vars */
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    messages: [],
    aiLoader: false,
    view: null,
};

const CompassV1 = createSlice({
    name: "CompassV1",
    initialState,
    reducers: {
        AddMessage: (state, action) => {
            state.messages.push(action.payload);
            state.aiLoader = true;
        },
        ClearMessage: (state, action) => {
            state.messages = [];
        },
        ToggleLoader: (state, action) => {
            state.aiLoader = false;
        },
        ToggleView: (state, action) => {
            state.view = action.payload;
        },
    },
});

export const {
    AddMessage,
    ClearMessage,
    ToggleLoader,
    getLastAiMessage,
    ToggleView,
} = CompassV1.actions;

// تصحيح الدالة لاستقبال state كامل والتوجه إلى slice الصحيح
export const getLastAiRes = (state) => {
    console.log(state);
    // الوصول إلى messages من خلال slice CompassV1
    const aiMessages =
        state?.CompassV1?.messages?.filter((msg) => msg.role === "ai") || [];

    if (aiMessages.length === 0) {
        return null;
    }
    return aiMessages[aiMessages.length - 1];
};

export default CompassV1.reducer;

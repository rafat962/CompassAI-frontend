/* eslint-disable no-unused-vars */
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    messages: [],
    aiLoader: false,
    view: null,
    fields: [],
    selectedField: "",
};

const CompassV2 = createSlice({
    name: "CompassV2",
    initialState,
    reducers: {
        AddMessage: (state, action) => {
            state.messages.push(action.payload);
            state.aiLoader = true;
        },
        AddFields: (state, action) => {
            state.fields = action.payload.fields;
            state.messages.push({
                role: "system",
                message: action.payload.fields,
                name: action.payload.name,
            });
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
        ToggleSelectField: (state, action) => {
            state.selectedField = action.payload;
        },
        ClearSelectField: (state, action) => {
            state.selectedField = "";
        },
    },
});

export const {
    AddMessage,
    AddFields,
    ToggleSelectField,
    ClearMessage,
    ToggleLoader,
    ClearSelectField,
    getLastAiMessage,
    ToggleView,
} = CompassV2.actions;

// تصحيح الدالة لاستقبال state كامل والتوجه إلى slice الصحيح
export const getLastAiRes = (state) => {
    // الوصول إلى messages من خلال slice CompassV2
    const aiMessages =
        state?.CompassV2?.messages?.filter((msg) => msg.role === "ai") || [];
    if (aiMessages.length === 0) {
        return null;
    }
    return aiMessages[aiMessages.length - 1];
};

export default CompassV2.reducer;

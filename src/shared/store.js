import { configureStore } from "@reduxjs/toolkit";
import authReducers from "../components/Auth/AuthSlice";
import mapReducers from "./redux/MapSlice";
import CompassV1Reducers from "../components/compassAI-v1/Chat/redux/Compass-V1Slice";
import CompassV2Reducers from "../components/CompassAI-V2/Chat/redux/Compass-V2Slice";
import CompassV3Reducers from "../components/CompassAI-V3/Chat/redux/Compass-V3Slice";

const store = configureStore({
    reducer: {
        authorization: authReducers,
        map: mapReducers,
        CompassV1: CompassV1Reducers,
        CompassV2: CompassV2Reducers,
        CompassV3: CompassV3Reducers,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // ✅ ignore non-serializable
        }),
});

export default store;

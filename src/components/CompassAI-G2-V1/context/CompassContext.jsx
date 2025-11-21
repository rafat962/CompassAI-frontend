/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useReducer } from "react";

const CompassPrContext = createContext();

const initState = {
    mode: "table",
    layer: null,
    FeatureLayer: "",
    view: null,
    VFeatureLayer: "",
    VLayerMode: true,
};

function reducer(state, action) {
    switch (action.type) {
        case "mode":
            return {
                ...state,
                mode: action.status,
            };
        case "layer":
            return {
                ...state,
                layer: action.layer,
            };
        case "FeatureLayer":
            return {
                ...state,
                FeatureLayer: action.FeatureLayer,
            };
        case "view":
            return {
                ...state,
                view: action.view,
            };
        case "VFeatureLayer":
            return {
                ...state,
                VFeatureLayer: action.VFeatureLayer,
            };
        case "VLayerMode":
            return {
                ...state,
                VLayerMode: action.VLayerMode,
            };

        default:
            console.warn("INVALID ACTION TYPE:", action.type);
            return state; // لازم نرجّع state مش Error
    }
}

const CompassProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initState);

    return (
        <CompassPrContext.Provider value={{ state, dispatch }}>
            {children}
        </CompassPrContext.Provider>
    );
};

function useCompassContext() {
    const context = useContext(CompassPrContext);
    if (context === undefined) {
        throw new Error(
            "useCompassContext must be used within <CompassProvider>"
        );
    }
    return context;
}

export { CompassProvider, useCompassContext };

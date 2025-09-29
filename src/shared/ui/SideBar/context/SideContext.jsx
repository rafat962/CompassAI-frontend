/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useReducer } from "react";

const sideContext = createContext();

const initState = {
    wekala: false,
    billboards: false,
    investmentAssets: false,
    DistributorsDashBoard: false,
    Channels: false,
    Industrial: false,
    Electrical: false,
    Irrigation: false,
    Posters: false,
    PumpStation: false,
    Pivots: false,
    Roads: false,
    openNav: false,
    NavWidth: "w-[3.2rem]",
};

function reducer(state, action) {
    switch (action.type) {
        case "Pivots":
            return {
                ...state,
                Pivots: !state.Pivots,
            };
        case "openNav":
            return { ...state, openNav: !state.openNav };
        case "NavWidth":
            return {
                ...state,
                NavWidth: `${
                    state.NavWidth === "w-[13rem]" ? "w-[3.2rem]" : "w-[13rem]"
                }`,
            };
        default:
            return new Error("INVALID Action");
    }
}

const SideContext = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initState);

    return (
        <sideContext.Provider value={{ dispatch, state }}>
            {children}
        </sideContext.Provider>
    );
};

function useSideBar() {
    const context = useContext(sideContext);
    if (context === undefined)
        throw new Error("useSideBar must be used within a SideContextProvider");
    return context;
}

export { SideContext, useSideBar };

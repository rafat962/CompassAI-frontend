import { CircularProgress } from "@mui/material";
import React from "react";

const Loader = ({ size = 100 }) => {
    return (
        <div className="flex items-center justify-center w-full h-[100vh]">
            <CircularProgress size={size} />
        </div>
    );
};

export default Loader;

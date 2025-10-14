import React from "react";
import { Outlet } from "react-router-dom";

const Share = ({ children }) => {
    return <div className="w-[100vw] h-[100vh]">{children}</div>;
};

export default Share;

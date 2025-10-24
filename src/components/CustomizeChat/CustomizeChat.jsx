/* eslint-disable no-unused-vars */
import React from "react";
import MangeChat from "../CompassAI-V3/Chat/mangeChat";
import { Controller, useForm } from "react-hook-form";
import { Button, MenuItem, TextField } from "@mui/material";
import ChatLayer from "./utils/ChatLayer";
import ChatStyle from "./utils/ChatStyle";

const CustomizeChat = () => {
    return (
        <div className="w-[100vw] h-[100vh]">
            <div className="w-full h-full  p-2">
                {/* main container */}
                <div className="w-full h-full grid grid-cols-12 grid-rows-2 lg:grid-rows-1 gap-1 rounded-2xl overflow-hidden">
                    {/* form */}
                    <div className="col-span-12 lg:col-span-7 row-span-1 lg:row-span-1 border-2 border-gray-500 rounded-2xl overflow-hidden">
                        <div className="w-full h-full flex flex-col items-center justify-start">
                            {/* Header */}
                            <div className="flex items-center justify-center w-full border-b-2 border-b-blue-800 p-3">
                                <p className="text-2xl font-bold font-mono">
                                    Customize CompassAI For You
                                </p>
                            </div>
                            {/* Body */}
                            <div className="flex items-start justify-between w-full h-full space-x-1 p-3">
                                <ChatLayer />
                                {/* right */}
                                <ChatStyle />
                            </div>
                        </div>
                    </div>
                    {/* chat */}
                    <div className="col-span-12  lg:col-span-5 row-span-1 lg:row-span-1">
                        <MangeChat />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomizeChat;

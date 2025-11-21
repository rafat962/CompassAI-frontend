/* eslint-disable no-unused-vars */
import { LucideBrain } from "lucide-react";
import React from "react";
import { IoCaretForwardOutline } from "react-icons/io5";
const Thinking = ({ message }) => {
    return (
        <div className=" outline-2 outline-gray-200 absolute w-200 h-12 shadow-[0_3px_15px_rgba(20,120,255,0.45)] bg-gray-50  z-20 rounded-xl flex items-center justify-start p-2 overflow-auto">
            <p className="text-black text-sm">{message}</p>
            <IoCaretForwardOutline className=" absolute right-1 text-3xl text-purple-500 cursor-pointer" />
        </div>
    );
};

export default Thinking;

import React from "react";
import { Tooltip } from "@mui/material";
import { LuCopy } from "react-icons/lu";
const UserMessage = ({ item, CopyResponse }) => {
    return (
        <div
            key={item.message}
            className="w-fit h-fit flex flex-col items-end justify-start"
        >
            <div
                dir="rtl"
                className="h-fit w-fit flex flex-col max-w-75 outline-2 outline-neutral-300 bg-neutral-200 p-3 rounded-3xl rounded-tr-xs"
            >
                <p>{item.message}</p>
                {/* copy */}
                <div
                    onClick={() => CopyResponse(item.message)}
                    className="w-full flex items-center justify-end"
                >
                    <Tooltip title="Copy">
                        <LuCopy className="text-end cursor-pointer" />
                    </Tooltip>
                </div>
            </div>
        </div>
    );
};

export default UserMessage;

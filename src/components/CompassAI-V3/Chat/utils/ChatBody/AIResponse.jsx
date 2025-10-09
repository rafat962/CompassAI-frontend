/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { TextGenerateEffect } from "../../../../../shared/ui/aceternityUI/TextGenerateEffect";
import { Tooltip } from "@mui/material";
import { LuCopy } from "react-icons/lu";

const AIResponse = ({ data, CopyResponse }) => {
    const [type, setType] = useState("metadata");
    const [message, setMessage] = useState("sas");
    useEffect(() => {
        // if (!data) return;
        console.log("darta2", data);
        switch (type) {
            case "other":
                //Done
                let resExample = "Hello! s";
                setMessage(data?.result?.message);
                break;
            case "aggregation":
                setMessage(data?.result?.data);
                break;
            case "visualize":
                setMessage(data?.result?.message);
                break;
            case "metadata":
                let resExamplemetadata =
                    "The fields Lot_Type, Size, Price_USD, Status, SizeFT, Parcel_View, Land_Terrain, Lot_NUM, and Price_JMD are string fields.";
                // setMessage(resExamplemetadata);
                setMessage(data?.result?.message);
                break;
            case "sql-query":
                setMessage(data?.result?.data);
                break;
            default:
                break;
        }
        // setType(data?.type);
    }, [data]);
    return (
        <div
            key={message}
            className="w-full h-fit flex flex-col items-start justify-start"
        >
            <div className="h-fit w-fit max-w-95 max-h-130 overflow-auto bg-blue-200 outline-1 outline-blue-500 p-1 py-0 rounded-2xl rounded-tl-xs items-center space-y-2">
                {type === "sql-query" && (
                    <p className=" text-wrap w-full">{message}</p>
                )}
                {type === "aggregation" && (
                    <p dir="ltr" className=" text-wrap w-full p-1">
                        <TextGenerateEffect words="asdasd asfdasf asdsadsasaasdas sadsadd assa d as asd dsa sad d sda as dsads " />
                    </p>
                )}
                {type === "metadata" && (
                    <p dir="ltr" className=" text-wrap w-full p-1">
                        <TextGenerateEffect words={message} />
                    </p>
                )}
                {type === "visualize" && (
                    <p dir="ltr" className=" text-wrap w-full p-1">
                        <TextGenerateEffect words={message} />
                    </p>
                )}
                {type === "chart" && (
                    <p dir="ltr" className=" text-wrap w-full p-1">
                        <TextGenerateEffect words={message} />
                    </p>
                )}
                {type === "other" && (
                    <p dir="ltr" className=" text-wrap w-full p-1">
                        <TextGenerateEffect words={message} />
                    </p>
                )}
                {/* copy */}
                <div
                    onClick={() => CopyResponse(message)}
                    className="w-full flex items-center justify-end p-1"
                >
                    <Tooltip title="Copy">
                        <LuCopy className="text-end cursor-pointer" />
                    </Tooltip>
                </div>
            </div>
        </div>
    );
};

export default AIResponse;

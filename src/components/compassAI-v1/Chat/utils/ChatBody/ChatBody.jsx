/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { FlipWords } from "../../../../../shared/ui/aceternityUI/FlipWords";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { LoaderOne } from "../../../../../shared/ui/aceternityUI/LoaderOne";
import { TypewriterEffect } from "../../../../../shared/ui/aceternityUI/TypewriterEffect";
import { TextGenerateEffect } from "../../../../../shared/ui/aceternityUI/TextGenerateEffect";
import { Tooltip } from "@mui/material";
import { LuCopy } from "react-icons/lu";

const ChatBody = () => {
    const { messages, aiLoader } = useSelector((state) => state.CompassV1);

    const CopyResponse = (message) => {
        if (!message) return;
        navigator.clipboard
            .writeText(message)
            .then(() => {
                toast.success("Message copied to clipboard ✅");
            })
            .catch(() => {
                toast.error("❌ Failed to copy message");
            });
    };
    return (
        <>
            {/* No Chat Case */}
            {messages.length == 0 && (
                <div className="w-full h-full flex space-y-4 flex-col items-center justify-center lg:pb-30">
                    {/* logo */}
                    <div className="w-20 h-20">
                        <img
                            className="w-full h-full object-cover"
                            src="/compass.png"
                            alt=""
                        />
                    </div>
                    {/* text */}
                    <div className="flex flex-col items-center justify-center space-y-1">
                        {/* Name */}
                        <h1 className="text-xl font-thr font-semibold">
                            <FlipWords words={["CompassAI"]} />
                        </h1>
                        {/* MESSAGE */}
                        <p className="font-sec text-sm text-center">
                            Hi, I'm Compass your AI Agent, How Can I Help You ?
                        </p>
                    </div>
                </div>
            )}
            {/* main container */}
            {messages.length > 0 && (
                <div className="w-full h-full flex flex-col items-end justify-start p-4 space-y-3 font-sec">
                    <>
                        {messages.map((item) => {
                            if (item.role == "user") {
                                return (
                                    <div
                                        key={item.message}
                                        className="w-fit h-fit flex flex-col items-end justify-start"
                                    >
                                        <div
                                            dir="rtl"
                                            className="h-fit w-fit flex flex-col max-w-75 bg-neutral-200 p-3 rounded-3xl rounded-tr-xs"
                                        >
                                            <p>{item.message}</p>
                                            {/* copy */}
                                            <div
                                                onClick={() =>
                                                    CopyResponse(item.message)
                                                }
                                                className="w-full flex items-center justify-end"
                                            >
                                                <Tooltip title="Copy">
                                                    <LuCopy className="text-end cursor-pointer" />
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                );
                                // ai case
                            } else if (item.role == "ai") {
                                return (
                                    <div
                                        key={item.message}
                                        className="w-full h-fit flex flex-col items-start justify-start"
                                    >
                                        <div className="h-fit w-fit max-w-95 max-h-130 overflow-auto bg-blue-200 p-1 py-0 rounded-3xl rounded-tl-xs items-center space-y-2">
                                            {item.type === "aggregation" && (
                                                <p
                                                    dir="ltr"
                                                    className=" text-wrap w-full p-1"
                                                >
                                                    <TextGenerateEffect
                                                        words={item.message}
                                                    />
                                                </p>
                                            )}
                                            {item.type === "sql" && (
                                                <p className=" text-wrap w-full">
                                                    {item.message}
                                                </p>
                                            )}
                                            {/* copy */}
                                            <div
                                                onClick={() =>
                                                    CopyResponse(item.message)
                                                }
                                                className="w-full flex items-center justify-end"
                                            >
                                                {/* <Tooltip title="Copy">
                                                    <LuCopy className="text-end cursor-pointer" />
                                                </Tooltip> */}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        })}
                        {/* onThinking case */}
                        {aiLoader && (
                            <div className="pb-6 flex w-full  items-start justify-start">
                                <div className="w-full h-fit flex flex-col items-start justify-start">
                                    {/* thinling */}
                                    <LoaderOne text="Generating chat..." />
                                </div>
                            </div>
                        )}
                    </>
                </div>
            )}
        </>
    );
};

export default ChatBody;

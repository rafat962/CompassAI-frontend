/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";
import ControlledOpenSpeedDial from "../../../../../shared/ui/ControlledOpenSpeedDial";
import { LuSendHorizontal } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import {
    AddMessage,
    ClearSelectField,
    ToggleLoader,
} from "../../redux/Compass-V3Slice";
import { useSendMessage } from "../../hooks/useChat";
import toast from "react-hot-toast";
import { ParcelsUrl } from "../../../../../shared/static/StaticLayersData";
import { drawGraphics } from "../../../../../shared/helpers/DrawGraphics";
import { useSearchParams } from "react-router-dom";

/**
 * @typedef {Object} MessageInterface
 * @property {string} role
 * @property {string} message
 */

const MessageBox = () => {
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();
    const { view, selectedField, layerUrl, messages } = useSelector(
        (state) => state.CompassV3,
    );

    const token = searchParams.get("token");
    const ApiKey = searchParams.get("ApiKey");

    const { register, handleSubmit, reset, getValues } = useForm();

    useEffect(() => {
        const message = getValues("message");
        if (selectedField) {
            reset({
                message: message + " " + selectedField,
            });
        }
    }, [selectedField]);

    // send Message
    const { isPending, SendMessageMutate } = useSendMessage();

    const onSuccess = (data) => {
        const message = data.message;
        if (message.length < 4) {
            return;
        }

        // Add user message to UI
        dispatch(
            AddMessage({
                role: "user",
                message,
            }),
        );

        dispatch(ClearSelectField());
        reset({
            message: "",
        });

        let sendHistoryToBackend = messages;

        // --- Sandbox Logic Implementation ---
        const isSandbox = ApiKey === "sandbox";

        const payload = {
            message,
            // If sandbox, use hardcoded sample layer, else use dynamic layerUrl from redux
            featureUrl: isSandbox
                ? "https://services3.arcgis.com/UDCw00RKDRKPqASe/arcgis/rest/services/Land/FeatureServer"
                : layerUrl,
            // If sandbox, token might be handled by backend or env, else use URL token
            token: isSandbox ? "" : token,
            history: sendHistoryToBackend,
            ApiKey: ApiKey, // Will be "sandbox" or the actual key
        };

        SendMessageMutate(payload, {
            onSuccess: (data) => {
                if (data.status === "success") {
                    dispatch(
                        AddMessage({
                            role: "ai",
                            message: data,
                        }),
                    );
                } else {
                    toast.error(data?.message);
                }
                dispatch(ToggleLoader());
            },
            onError: (err) => {
                dispatch(ToggleLoader());
            },
        });
    };

    const SubmitWithEnter = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(onSuccess)();
        }
    };

    const textareaRef = useRef();
    const handleInput = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
        }
    };

    return (
        <>
            <div className=" bg-gradient-to-r from-transparent via-blue-800 to-transparent h-[1.5px] w-full" />
            <div className="flex w-full h-full p-1 md:p-4 trans">
                <form
                    onSubmit={handleSubmit(onSuccess)}
                    onKeyDown={(e) => SubmitWithEnter(e)}
                    style={
                        searchParams.get("textAreaColor")
                            ? {
                                  backgroundColor:
                                      searchParams.get("textAreaColor"),
                              }
                            : {}
                    }
                    className={`flex flex-col items-center justify-center h-fit w-full 
                                focus-within:border-blue-800 rounded-2xl md:rounded-4xl 
                                 bg-neutral-300
                                dark:bg-neutral-800 
                                    px-2 md:px-4 py-1 md:py-2 border border-white shadow-sm`}
                >
                    <textarea
                        {...register("message")}
                        ref={(e) => {
                            register("message").ref(e);
                            textareaRef.current = e;
                        }}
                        placeholder="Type your message..."
                        rows={1}
                        onInput={handleInput}
                        className={` w-full ${searchParams.get("textAreaFont") ? `font-${searchParams.get("textAreaFont")}` : "font-sans"} trans resize-none bg-transparent focus:outline-none overflow-auto max-h-20 md:max-h-30 row-start-1 px-4 my-1`}
                    />
                    <div className="flex items-center justify-between w-full py-1 md:py-2 px-2">
                        <div
                            className={`w-fit h-fit relative p-2 mr-6 col-span-1`}
                        >
                            <ControlledOpenSpeedDial />
                        </div>
                        <a
                            href="https://raafatkamel.netlify.app/"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center space-x-2 group"
                        >
                            <p className=" group-hover:text-blue-600 trans tracking-widest capitalize text-sm font-sec text-gray-700">
                                Powerd By
                            </p>
                            <div className="w-7 h-7 object-cover ">
                                <img src="/header/R.K logo.png" alt="" />
                            </div>
                        </a>
                        <button
                            type="submit"
                            className={` shadow-2xl col-span-1 flex items-center justify-center rounded-full dark:bg-blue-900 bg-sec p-2 cursor-pointer group border-1 border-sec hover:border-blue-800 dark:border-blue-800 dark:hover:border-sec trans`}
                        >
                            <LuSendHorizontal className=" text-lg group-hover:text-blue-800 dark:group-hover:text-white dark:group-hover:brightness-200  trans" />
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default MessageBox;

/* eslint-disable no-unused-vars */
import {
    Highlighter,
    Loader,
    Loader2,
    LucideBrainCircuit,
    SplineIcon,
} from "lucide-react";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { ImMap2, ImTable2, ImSpinner2 } from "react-icons/im";
import { useCompassContext } from "../../context/CompassContext";
import VLayer from "./VLayer/VLayer";
import { useSendMessage } from "../../hooks/useChatEdit";
import { useSearchParams } from "react-router";
import { handleResponse } from "../../helpers/handleResponse";
import Thinking from "./Thinking/Thinking";
import toast from "react-hot-toast";

const Prompt = () => {
    const [loading, setLoading] = useState(false);
    const [displayItem, setDisplayItem] = useState("table");
    const [searchParams] = useSearchParams();
    const { isPending, SendMessageMutate } = useSendMessage();
    const { state, dispatch } = useCompassContext();
    const { register, handleSubmit } = useForm();
    const onSuccess = (data) => {
        let { message } = data;
        if (!message) return;
        const layerUrl = searchParams.get("layerUrl");
        let layer = `${layerUrl}/0`;
        const { VLayerMode, VFeatureLayer, FeatureLayer } = state;
        setLoading(true);

        SendMessageMutate(
            { message: message, featureUrl: layer },
            {
                onSuccess: async (data) => {
                    if (
                        data.status == "success" &&
                        data.result.status == "success"
                    ) {
                        let layer = VLayerMode ? VFeatureLayer : FeatureLayer;
                        const res = await handleResponse(
                            data.type,
                            layer,
                            data.result
                        );
                        console.log(res);
                        setLoading(false);
                    }
                },
                onError: (err) => {
                    setLoading(false);
                    console.log(err);
                    toast.error(err.message);
                },
            }
        );
    };
    // Handle Display Item
    function ChangeDisplay(item) {
        setDisplayItem(item);
        dispatch({ type: "mode", status: item });
    }
    return (
        <div className="w-full h-fit p-2 m-1 flex items-center justify-between">
            <div className="flex items-center w-25 justify-center space-x-1 px-4 h-17 bg-white rounded-xl shadow-[0_4px_20px_rgba(80,120,255,0.45)]">
                {/* map */}
                <div
                    onClick={() => ChangeDisplay("map")}
                    className={`${displayItem === "map" && "bg-blue-100"} p-2 cursor-pointer rounded-md hover:bg-blue-100 trans`}
                >
                    <ImMap2 className="text-xl " />
                </div>
                {/* table */}
                <div
                    onClick={() => ChangeDisplay("table")}
                    className={`${displayItem === "table" && "bg-blue-100"} p-2 cursor-pointer rounded-md  hover:bg-blue-100 trans`}
                >
                    <ImTable2 className="text-xl cursor-pointer " />
                </div>
                {/* Two */}
            </div>
            <motion.form
                onSubmit={handleSubmit(onSuccess)}
                className="
                    relative flex items-center justify-between w-[70%] h-17 bg-white 
                    rounded-xl  outline-3 outline-gray-300 px-4 focus-within:outline-blue-500
                "
                animate={
                    loading
                        ? {
                              boxShadow: [
                                  "0 0 60px rgba(120,80,255,0.4)",
                                  "0 0 60px rgba(80,150,255,0.55)",
                                  "0 0 60px rgba(0,200,255,0.7)",
                                  "0 0 60px rgba(80,150,255,0.55)",
                                  "0 0 60px rgba(120,80,255,0.4)",
                              ],
                          }
                        : {
                              boxShadow: "0 4px 20px rgba(80,120,255,0.45)",
                              scale: 1,
                          }
                }
                transition={
                    loading
                        ? {
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                          }
                        : {
                              duration: 0.5,
                          }
                }
            >
                <input
                    {...register("message")}
                    type="text"
                    className="flex-1 outline-none h-full"
                />
                <button
                    className={`flex relative  w-48 items-center justify-center space-x-2 z-10 cursor-pointer ml-4 px-6 py-2 rounded-xl text-white font-medium bg-gradient-to-r from-purple-500 to-blue-500 shadow-[0_5px_15px_rgba(20,120,255,0.45)] hover:opacity-90 transition`}
                >
                    <p>Ask Compass</p>
                    {!loading && <LucideBrainCircuit className="w-6" />}
                    {loading && <ImSpinner2 className=" animate-spin w-6" />}
                </button>
            </motion.form>
            <div>
                <VLayer />
            </div>
        </div>
    );
};

export default Prompt;

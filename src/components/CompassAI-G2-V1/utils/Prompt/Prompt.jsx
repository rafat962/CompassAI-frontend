/* eslint-disable no-unused-vars */
import { LucideBrainCircuit } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { ImMap2, ImTable2, ImSpinner2 } from "react-icons/im";
import { useCompassContext } from "../../context/CompassContext";
import VLayer from "./VLayer/VLayer";
import { useSendMessage } from "../../hooks/useChatEdit";
import { useSearchParams } from "react-router";
import { handleResponse } from "../../helpers/handleResponse";
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
        const ApiKey = searchParams.get("ApiKey");
        const isSandbox = ApiKey === "sandbox";

        const Localtoken = searchParams.get("token");
        let token = isSandbox
            ? JSON.parse(localStorage.getItem("LayerToken"))
            : Localtoken;
        let layer = `${isSandbox ? import.meta.env.VITE_FEATURE : layerUrl}/0`;
        const { VLayerMode, VFeatureLayer, FeatureLayer } = state;

        setLoading(true);
        SendMessageMutate(
            { message: message, featureUrl: layer, ApiKey, token },
            {
                onSuccess: async (data) => {
                    console.log("data", data);
                    if (
                        data?.status === "success" &&
                        data?.result.status === "success"
                    ) {
                        setLoading(false);
                        let layerObj = VLayerMode
                            ? VFeatureLayer
                            : FeatureLayer;
                        await handleResponse(data.type, layerObj, data.result);
                    } else {
                        setLoading(false);
                        toast.error(data.result.error || "Error occurred", {
                            duration: 8000,
                        });
                    }
                },
                onError: (err) => {
                    setLoading(false);
                    toast.error(err.message);
                },
            },
        );
    };

    function ChangeDisplay(item) {
        setDisplayItem(item);
        dispatch({ type: "mode", status: item });
    }

    return (
        <div className="w-full h-fit p-2 flex flex-col md:flex-row items-center justify-between gap-3 lg:gap-4">
            {/* Display Toggle - Responsive Width */}
            <div className="flex items-center justify-center space-x-1 px-3 h-14 md:h-16 bg-white rounded-xl shadow-[0_4px_20px_rgba(80,120,255,0.45)] w-full md:w-auto">
                <div
                    onClick={() => ChangeDisplay("map")}
                    className={`${displayItem === "map" ? "bg-blue-100" : ""} p-3 cursor-pointer rounded-md hover:bg-blue-100 transition-colors`}
                >
                    <ImMap2 className="text-xl md:text-2xl" />
                </div>
                <div
                    onClick={() => ChangeDisplay("table")}
                    className={`${displayItem === "table" ? "bg-blue-100" : ""} p-3 cursor-pointer rounded-md hover:bg-blue-100 transition-colors`}
                >
                    <ImTable2 className="text-xl md:text-2xl" />
                </div>
            </div>

            {/* Main Form - Dynamic width and height */}
            <motion.form
                onSubmit={handleSubmit(onSuccess)}
                className="relative flex items-center justify-between w-full md:max-w-[60%] lg:max-w-[70%] min-h-[56px] md:h-16 bg-white rounded-xl outline outline-2 outline-gray-200 px-3 md:px-4 focus-within:outline-blue-500 transition-all"
                animate={
                    isPending
                        ? {
                              boxShadow: [
                                  "0 0 20px rgba(120,80,255,0.4)",
                                  "0 0 40px rgba(0,200,255,0.6)",
                                  "0 0 20px rgba(120,80,255,0.4)",
                              ],
                          }
                        : {
                              boxShadow: "0 4px 20px rgba(80,120,255,0.3)",
                          }
                }
                transition={
                    isPending
                        ? { duration: 2, repeat: Infinity }
                        : { duration: 0.5 }
                }
            >
                <input
                    {...register("message")}
                    type="text"
                    placeholder="Ask Compass..."
                    className="flex-1 outline-none bg-transparent h-full py-2 text-sm md:text-base"
                />

                <button
                    disabled={isPending}
                    className="flex cursor-pointer items-center justify-center space-x-2 px-4 md:px-6 py-2 ml-2 rounded-xl text-white font-medium bg-gradient-to-r from-purple-500 to-blue-500 shadow-md hover:opacity-90 transition-all shrink-0"
                >
                    <span className="hidden sm:inline text-sm md:text-base">
                        Ask Compass
                    </span>
                    {isPending ? (
                        <ImSpinner2 className="animate-spin w-5 h-5" />
                    ) : (
                        <LucideBrainCircuit className="w-5 h-5" />
                    )}
                </button>
            </motion.form>

            {/* VLayer Wrapper */}
            <div className="w-full md:w-auto flex justify-center md:justify-end">
                <VLayer />
            </div>
        </div>
    );
};

export default Prompt;
